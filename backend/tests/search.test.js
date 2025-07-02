const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../models/userModel');

// Bu test dosyasındaki tüm testler çalışmadan önce, authMiddleware modülünü taklit et.
jest.mock('../middleware/authMiddleware', () => ({
  protect: (req, res, next) => {
    // Controller'ın ihtiyaç duyduğu 'req.user' nesnesini isteğe manuel olarak ekle.
    req.user = { _id: 'aktif_kullanici_id' };
    // ve doğrulamayı atlayarak doğrudan controller'a geç.
    next();
  },
}));

// userModel'in kendisini de taklit etmemiz gerekiyor.
jest.mock('../models/userModel');

describe("Kullanıcı Arama API'si (/api/user)", () => {
  
  // Testler bittikten sonra veritabanı bağlantısını kapat.
  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('kimlik doğrulaması taklit edildiğinde ve arama yapıldığında kullanıcı listesi döndürmelidir', async () => {
    // 1. Hazırlık
    const aramaKelimesi = 'test';
    const sahteKullanicilar = [
      { _id: 'kullanici1', name: 'Test Kullanıcısı 1' },
      { _id: 'kullanici2', name: 'Test Kullanıcısı 2' },
    ];

    // Controller'ın User.find() çağrısını taklit et.
    // allUsers fonksiyonu .find().find() şeklinde bir zincirleme (chain) yapar.
    // Bu zinciri taklit etmek için, ilk find'ın, ikinci find metoduna sahip bir nesne döndürmesini sağlamalıyız.
    const userFindQuery = { find: jest.fn().mockResolvedValue(sahteKullanicilar) };
    User.find.mockReturnValue(userFindQuery);

    // 2. Eylem
    const response = await request(app).get(`/api/user?search=${aramaKelimesi}`);

    // 3. Doğrulama
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body[0].name).toBe('Test Kullanıcısı 1');
  });
}); 