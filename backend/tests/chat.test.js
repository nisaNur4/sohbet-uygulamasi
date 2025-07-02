const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const Chat = require('../models/chatModel');
const User = require('../models/userModel');

// Middleware'i taklit et
jest.mock('../middleware/authMiddleware', () => ({
  protect: (req, res, next) => {
    req.user = { _id: 'giriş_yapmış_kullanıcı_id' };
    next();
  },
}));

// Modelleri taklit et
jest.mock('../models/chatModel');
jest.mock('../models/userModel');

describe("Sohbet API'si (/api/chat)", () => {

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/chat - accessChat', () => {

    it('iki kullanıcı arasında zaten bir sohbet varsa, o sohbeti döndürmelidir', async () => {
      // 1. Hazırlık
      const hedefKullaniciId = 'hedef_kullanıcı_id';
      const sahteMevcutSohbet = {
        _id: 'mevcut_sohbet_id',
        isGroupChat: false,
        users: [
          { _id: 'giriş_yapmış_kullanıcı_id', name: 'Giriş Yapan' },
          { _id: hedefKullaniciId, name: 'Hedef Kullanıcı' }
        ],
        latestMessage: { sender: { name: 'Test' } }, // populate için sahte veri
      };

      // Mongoose'un zincirleme sorgu yapısını doğru taklit etme:
      // Her .populate() çağrısı, bir promise döndüren başka bir .populate() metodu
      // içeren bir nesneye çözümlenmelidir.
      const populateChain = {
        populate: jest.fn().mockResolvedValue([sahteMevcutSohbet]),
      };
      Chat.find.mockImplementation(() => ({
        populate: () => populateChain
      }));
      
      // User.populate taklidini de yapıyoruz.
      User.populate.mockResolvedValue([sahteMevcutSohbet]);

      // 2. Eylem
      const response = await request(app)
        .post('/api/chat')
        .send({ userId: hedefKullaniciId });
      
      // 3. Doğrulama
      expect(response.statusCode).toBe(200);
      expect(response.body._id).toBe(sahteMevcutSohbet._id);
    });

    it('iki kullanıcı arasında sohbet yoksa, yeni bir tane oluşturmalıdır', async () => {
        // 1. Hazırlık
        const hedefKullaniciId = 'yeni_hedef_id';
        const yeniOlusturulanSohbet = {
            _id: 'yeni_sohbet_id',
            users: ['giriş_yapmış_kullanıcı_id', hedefKullaniciId],
        };

        // Mevcut sohbet bulunamadı senaryosu: Chat.find boş dizi dönsün.
        const emptyPopulateChain = { populate: jest.fn().mockResolvedValue([]) };
        Chat.find.mockImplementation(() => ({
            populate: () => emptyPopulateChain,
        }));
        User.populate.mockResolvedValue([]); // User.populate da boş dönsün.
        
        // Yeni sohbet oluşturma adımlarını taklit et
        Chat.create.mockResolvedValue(yeniOlusturulanSohbet);
        Chat.findOne.mockImplementation(() => ({
            populate: jest.fn().mockResolvedValue(yeniOlusturulanSohbet),
        }));

        // 2. Eylem
        const response = await request(app)
            .post('/api/chat')
            .send({ userId: hedefKullaniciId });

        // 3. Doğrulama
        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe('yeni_sohbet_id');
        expect(Chat.create).toHaveBeenCalled(); // create metodunun çağrıldığından emin ol.
    });

  });

  describe('GET /api/chat - fetchChats', () => {
    it('giriş yapmış kullanıcıya ait tüm sohbetleri listelemelidir', async () => {
      // 1. Hazırlık
      const sahteSohbetler = [ { _id: 'sohbet1' }, { _id: 'sohbet2' } ];
      // find().populate().populate().populate().sort() zincirini taklit et
      const query = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(sahteSohbetler)
      };
      Chat.find.mockReturnValue(query);
      User.populate.mockResolvedValue(sahteSohbetler);

      // 2. Eylem
      const response = await request(app).get('/api/chat');

      // 3. Doğrulama
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });
  });

  describe('POST /api/chat/group - createGroupChat', () => {
    it('gerekli bilgilerle yeni bir grup sohbeti oluşturmalıdır', async () => {
      // 1. Hazırlık
      const kullanicilar = JSON.stringify([{ _id: 'user1' }, { _id: 'user2' }]);
      const grupAdi = 'Test Grubu';
      const sahteGrup = { _id: 'grup1', chatName: grupAdi };

      Chat.create.mockResolvedValue(sahteGrup);
      Chat.findOne.mockImplementation(() => ({
        populate: () => ({
          populate: jest.fn().mockResolvedValue(sahteGrup)
        })
      }));

      // 2. Eylem
      const response = await request(app)
        .post('/api/chat/group')
        .send({ users: kullanicilar, name: grupAdi });

      // 3. Doğrulama
      expect(response.statusCode).toBe(200);
      expect(response.body.chatName).toBe(grupAdi);
    });

    it('eksik bilgi (kullanıcı veya isim) gönderildiğinde 400 hatası vermelidir', async () => {
      const response = await request(app)
        .post('/api/chat/group')
        .send({ name: 'Eksik Grup' });
      
      expect(response.statusCode).toBe(400);
    });
  });

  describe('PUT /api/chat/rename - renameGroup', () => {
    it('bir grubun adını başarılı bir şekilde değiştirmelidir', async () => {
      const guncellenmisSohbet = { _id: 'sohbet1', chatName: 'Yeni İsim' };
      Chat.findByIdAndUpdate.mockImplementation(() => ({
        populate: () => ({
          populate: jest.fn().mockResolvedValue(guncellenmisSohbet)
        })
      }));

      const response = await request(app)
        .put('/api/chat/rename')
        .send({ chatId: 'sohbet1', chatName: 'Yeni İsim' });
      
      expect(response.statusCode).toBe(200);
      expect(response.body.chatName).toBe('Yeni İsim');
    });
  });

  describe('PUT /api/chat/groupadd - addToGroup', () => {
    it('bir gruba yeni bir kullanıcı eklemelidir', async () => {
        const guncellenmisSohbet = { _id: 'sohbet1', users: ['user1', 'user2', 'yeni_kullanici'] };
        Chat.findByIdAndUpdate.mockImplementation(() => ({
            populate: () => ({ populate: jest.fn().mockResolvedValue(guncellenmisSohbet) })
        }));

        const response = await request(app)
            .put('/api/chat/groupadd')
            .send({ chatId: 'sohbet1', userId: 'yeni_kullanici' });

        expect(response.statusCode).toBe(200);
        expect(response.body.users).toContain('yeni_kullanici');
    });
  });

  describe('PUT /api/chat/groupremove - removeFromGroup', () => {
    it('bir kullanıcıyı gruptan çıkarmalıdır', async () => {
        const guncellenmisSohbet = { _id: 'sohbet1', users: ['user1'] };
        Chat.findByIdAndUpdate.mockImplementation(() => ({
            populate: () => ({ populate: jest.fn().mockResolvedValue(guncellenmisSohbet) })
        }));

        const response = await request(app)
            .put('/api/chat/groupremove')
            .send({ chatId: 'sohbet1', userId: 'cikarilan_kullanici' });
        
        expect(response.statusCode).toBe(200);
        expect(response.body.users).not.toContain('cikarilan_kullanici');
    });
  });

}); 