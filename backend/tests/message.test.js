const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const Message = require('../models/messageModel');
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
jest.mock('../models/messageModel');
jest.mock('../models/chatModel');
jest.mock('../models/userModel');

describe("Mesaj API'si (/api/message)", () => {

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/message/:chatId - allMessages', () => {
    it('bir sohbete ait tüm mesajları getirmelidir', async () => {
      // 1. Hazırlık
      const sahteMesajlar = [{ content: 'Merhaba' }, { content: 'Nasılsın?' }];
      Message.find.mockImplementation(() => ({
        populate: () => ({
          populate: jest.fn().mockResolvedValue(sahteMesajlar),
        }),
      }));

      // 2. Eylem
      const response = await request(app).get('/api/message/sohbet_id_123');

      // 3. Doğrulama
      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body[0].content).toBe('Merhaba');
    });
  });

  describe('POST /api/message - sendMessage', () => {
    it('yeni bir mesaj göndermeli ve kaydedilen mesajı döndürmelidir', async () => {
      // 1. Hazırlık
      const sahteMesajVerisi = {
        content: 'Bu bir test mesajıdır',
        chatId: 'sohbet_id_123'
      };
      
      const olusturulanMesaj = {
        _id: 'mesaj1',
        sender: 'giriş_yapmış_kullanıcı_id',
        content: sahteMesajVerisi.content,
        chat: sahteMesajVerisi.chatId,
        // populate metodunu taklit et. Düz bir nesneye bu metodu ekliyoruz.
        populate: jest.fn().mockReturnThis(),
      };

      // Populate zincirinin en sonu, doldurulmuş nesneyi döndürmeli.
      olusturulanMesaj.populate.mockResolvedValue(olusturulanMesaj);
      User.populate.mockResolvedValue(olusturulanMesaj);

      Message.create.mockResolvedValue(olusturulanMesaj);
      // findById da populate edilebilen bir nesne döndürmeli.
      Message.findById.mockResolvedValue(olusturulanMesaj);
      Chat.findByIdAndUpdate.mockResolvedValue(true);

      // 2. Eylem
      const response = await request(app)
        .post('/api/message')
        .send(sahteMesajVerisi);

      // 3. Doğrulama
      expect(response.statusCode).toBe(200);
      expect(response.body.content).toBe(sahteMesajVerisi.content);
      expect(Message.create).toHaveBeenCalled();
    });
  });
}); 