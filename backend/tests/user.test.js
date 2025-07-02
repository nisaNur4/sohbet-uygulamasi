// Gerekli modülleri import ediyoruz.
// supertest: API endpoint'lerimize sahte HTTP istekleri göndermek için kullanılır.
// app: Test edeceğimiz Express uygulamamız. server.js'den export edilmesi gerekecek.
const request = require('supertest');
const app = require('../server'); 
const mongoose = require('mongoose'); // Mongoose'u import et
// userModel'i taklit (mock) ediyoruz. Veritabanı işlemlerini simüle edeceğiz.
// Bu sayede testimiz veritabanına bağımlı olmaz ve daha hızlı çalışır.
const User = require('../models/userModel');
const jwt = require('jsonwebtoken'); // JWT kütüphanesini import et
jest.mock('../models/userModel');
// jest.mock('jsonwebtoken'); // <-- Bu global mock'u kaldırıyoruz. Diğer testleri bozuyor.

// authMiddleware'i taklit et.
// Bu, tüm '/api/user' rotalarındaki 'protect' kullanımını etkileyecektir.
// Bu yüzden bunu sadece ilgili test dosyasının en üstünde veya ilgili describe'dan önce yapmak önemlidir.
// Biz burada sadece arama testi için farklı bir yaklaşım deniyoruz.
jest.mock('../middleware/authMiddleware', () => ({
  // 'protect' fonksiyonunu yeniden tanımlıyoruz.
  protect: (req, res, next) => {
    // Controller'ın ihtiyaç duyduğu 'req.user' nesnesini manuel olarak ekliyoruz.
    req.user = {
      _id: 'aktif_kullanici_id',
      name: 'Aktif Kullanıcı',
      email: 'aktif@ornek.com',
    };
    // Hiçbir doğrulama yapmadan bir sonraki adıma (controller'a) geç.
    next();
  },
}));

// 'Kullanıcı Kaydı' test senaryoları için bir grup oluşturuyoruz.
describe('Kullanıcı Kayıt APIsi', () => {

  // Testler başlamadan önce çalışacak hook. Sunucuyu başlatır.
  let server;
  beforeAll((done) => {
    // Test için farklı bir portta dinle, gerçek sunucuyla çakışmasın.
    server = app.listen(5002, done); 
  });

  // Bütün testler bittikten sonra çalışacak hook.
  afterAll(async () => {
    server.close(); // Test sunucusunu kapat
    await mongoose.connection.close(); // Veritabanı bağlantısını kapat
  });


  // İlk test senaryomuz: Başarılı bir kullanıcı kaydı.
  it('tüm alanlar girildiğinde bir kullanıcıyı başarılı bir şekilde kaydetmelidir', async () => {
    // 1. Hazırlık (Arrange)
    // Sahte kullanıcı verileri oluşturuyoruz.
    const kullaniciVerisi = {
      name: 'Test Kullanıcısı',
      email: 'test@ornek.com',
      password: 'sifre123',
    };

    // userModel'in 'create' ve 'findOne' metodlarını taklit ediyoruz.
    // Bir kullanıcı oluşturmaya çalıştığında, sahte kullanıcı verisini döndürsün.
    // Bir kullanıcıyı e-posta ile aradığında, 'null' dönsün (yani kullanıcı mevcut değil).
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({
      _id: 'rastgele_kullanici_id',
      name: kullaniciVerisi.name,
      email: kullaniciVerisi.email,
      // Not: token oluşturma fonksiyonu ayrı test edilecek, burada sadece varlığını kontrol ediyoruz.
    });

    // 2. Eylem (Act)
    // API'mizin '/api/user' endpoint'ine POST isteği gönderiyoruz.
    const response = await request(app)
      .post('/api/user')
      .send(kullaniciVerisi);

    // 3. Doğrulama (Assert)
    // Beklentilerimizi kontrol ediyoruz.
    // - HTTP durum kodunun 201 (Created) olmasını bekliyoruz.
    expect(response.statusCode).toBe(201);
    // - Dönen cevabın içinde 'name', 'email' ve 'token' alanlarının olmasını bekliyoruz.
    expect(response.body).toHaveProperty('name', 'Test Kullanıcısı');
    expect(response.body).toHaveProperty('email', 'test@ornek.com');
    expect(response.body).toHaveProperty('token');
  });

  // İkinci test senaryosu: Eksik alanlarla kayıt denemesi.
  it('gerekli alanlar eksikse 400 durum kodu dönmelidir', async () => {
    // Sadece isim gönderiyoruz, email ve şifre eksik.
    const kullaniciVerisi = { name: 'Test Kullanıcısı' };

    const response = await request(app)
      .post('/api/user')
      .send(kullaniciVerisi);
    
    // Sunucunun 400 (Bad Request) hatası vermesini bekliyoruz.
    expect(response.statusCode).toBe(400);
  });
  
  // Üçüncü test senaryosu: Mevcut bir e-posta ile kayıt denemesi.
  it('e-posta adresi zaten mevcutsa 400 durum kodu dönmelidir', async () => {
    // 1. Hazırlık (Arrange)
    // Sahte kullanıcı verileri.
    const kullaniciVerisi = {
      name: 'Mevcut Kullanıcı',
      email: 'mevcut@ornek.com',
      password: 'sifre123',
    };

    // Bu sefer, User.findOne'un bir kullanıcı "bulmasını" sağlıyoruz.
    // Bu, veritabanında bu e-postanın zaten kayıtlı olduğu durumu simüle eder.
    User.findOne.mockResolvedValue({
      _id: 'varolan_kullanici_id',
      name: 'Mevcut Kullanıcı',
      email: 'mevcut@ornek.com',
    });

    // 2. Eylem (Act)
    // API'ye aynı e-posta ile yeni bir kayıt isteği gönderiyoruz.
    const response = await request(app)
      .post('/api/user')
      .send(kullaniciVerisi);

    // 3. Doğrulama (Assert)
    // Sunucunun, "Kullanıcı zaten mevcut" hatası verip 400 durum kodu
    // döndürmesini bekliyoruz.
    expect(response.statusCode).toBe(400);
  });
});

// 'Kullanıcı Girişi' test senaryoları için yeni bir grup.
describe("Kullanıcı Giriş API'si", () => {

  // Başarılı giriş senaryosu.
  it('doğru e-posta ve şifre verildiğinde 200 durum kodu ve token döndürmelidir', async () => {
    // 1. Hazırlık (Arrange)
    const girisVerisi = {
      email: 'test@ornek.com',
      password: 'sifre123',
    };

    // Sahte bir kullanıcı nesnesi oluşturuyoruz. Bu kullanıcı veritabanında "varmış gibi" davranacak.
    const sahteKullanici = {
      _id: 'rastgele_kullanici_id',
      name: 'Test Kullanıcısı',
      email: girisVerisi.email,
      // user.matchPassword metodunu taklit ediyoruz. Bu test için şifrenin doğru olduğunu varsayıyoruz.
      matchPassword: jest.fn().mockResolvedValue(true),
    };

    // User.findOne çağrıldığında, yukarıda hazırladığımız sahte kullanıcıyı döndürsün.
    User.findOne.mockResolvedValue(sahteKullanici);

    // 2. Eylem (Act)
    // API'nin '/api/user/login' endpoint'ine POST isteği gönderiyoruz.
    const response = await request(app)
      .post('/api/user/login')
      .send(girisVerisi);

    // 3. Doğrulama (Assert)
    // - Durum kodunun 200 (OK) olmasını bekliyoruz.
    expect(response.statusCode).toBe(200);
    // - Cevabın içinde bir 'token' alanı olmasını bekliyoruz.
    expect(response.body).toHaveProperty('token');
    // - Dönen kullanıcının e-postasının doğru olmasını bekliyoruz.
    expect(response.body).toHaveProperty('email', girisVerisi.email);
  });

  // Yanlış şifre senaryosu
  it('yanlış şifre girildiğinde 401 durum kodu döndürmelidir', async () => {
    // 1. Hazırlık
    const girisVerisi = { email: 'test@ornek.com', password: 'yanlisSifre' };
    const sahteKullanici = {
      _id: 'rastgele_kullanici_id',
      email: girisVerisi.email,
      // Bu sefer matchPassword'un 'false' dönmesini sağlıyoruz.
      matchPassword: jest.fn().mockResolvedValue(false), 
    };
    User.findOne.mockResolvedValue(sahteKullanici);

    // 2. Eylem
    const response = await request(app)
      .post('/api/user/login')
      .send(girisVerisi);

    // 3. Doğrulama
    expect(response.statusCode).toBe(401);
  });

  // Kullanıcı bulunamadı senaryosu
  it('kayıtlı olmayan bir e-posta girildiğinde 401 durum kodu döndürmelidir', async () => {
    // 1. Hazırlık
    const girisVerisi = { email: 'yok@ornek.com', password: 'sifre123' };
    // User.findOne'un 'null' dönmesini sağlayarak kullanıcıyı "bulamamasını" sağlıyoruz.
    User.findOne.mockResolvedValue(null);

    // 2. Eylem
    const response = await request(app)
      .post('/api/user/login')
      .send(girisVerisi);

    // 3. Doğrulama
    expect(response.statusCode).toBe(401);
  });
}); 