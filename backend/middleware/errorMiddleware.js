// 'notFound' middleware'i: Bu fonksiyon, sunucuda bulunamayan bir URL'ye (route) istek yapıldığında çalışır.
// Express'te belirli bir route ile eşleşmeyen tüm istekler en sona bırakılan bu middleware'e düşer.
const notFound = (req, res, next) => {
  // Yeni bir Error nesnesi oluşturuyoruz ve mesaj olarak hangi URL'nin bulunamadığını belirtiyoruz.
  // 'req.originalUrl', istemcinin talep ettiği orijinal URL'yi içerir.
  const error = new Error(`Bulunamadı - ${req.originalUrl}`);
  // HTTP durum kodunu 404 (Not Found) olarak ayarlıyoruz.
  res.status(404);
  // 'next' fonksiyonunu oluşturduğumuz hata nesnesi ile çağırarak Express'in bir sonraki
  // hata işleme middleware'ine errorHandler geçmesini sağlıyoruz.
  next(error);
};

// 'errorHandler' middleware'i: Bu, projedeki genel hata yakalayıcıdır.
// Herhangi bir route'da 'throw new Error()' ile bir hata fırlatıldığında veya 'next(error)' çağrıldığında
// Express bu fonksiyonu otomatik olarak çalıştırır.
// Dört parametre alması (err, req, res, next), onun bir hata işleme middleware'i olduğunu belirtir.
const errorHandler = (err, req, res, next) => {
  // Durum kodunu belirliyoruz. Eğer mevcut durum kodu 200 (OK) ise bu bir sunucu hatasıdır,
  // bu yüzden durumu 500 (Internal Server Error) olarak ayarlıyoruz. Değilse mevcut durum kodunu koruyoruz.
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  // Cevabın durum kodunu ayarlıyoruz.
  res.status(statusCode);
  // İstemciye JSON formatında bir cevap gönderiyoruz.
  res.json({
    // 'message': Hatanın mesajını içerir.
    message: err.message,
    // 'stack': Hatanın yığın izini (stack trace) içerir. Bu, hatanın kodun neresinde
    // meydana geldiğini gösteren detaylı bir bilgidir.
    // Sadece geliştirme ortamında ('production' değilken) yığın izini gönderiyoruz.
    // Üretim ortamında bu detayın gizlenmesi güvenlik açısından önemlidir.
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

// 'notFound' ve 'errorHandler' fonksiyonlarını dışa aktarıyoruz.
module.exports = { notFound, errorHandler };
