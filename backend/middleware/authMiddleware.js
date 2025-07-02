// JSON Web Token (JWT) kütüphanesini dahil ediyoruz. Token'ları doğrulamak için kullanılacak.
const jwt = require("jsonwebtoken");
// User modelini dahil ediyoruz. Token içerisinden gelen kullanıcı ID'si ile veri tabanından kullanıcıyı bulmak için gereklidir.
const User = require("../models/userModel.js");
// 'express-async-handler' kütüphanesini dahil ediyoruz. Bu, Express'teki asenkron fonksiyonlarda
// try-catch blokları kullanma zorunluluğunu ortadan kaldırarak hata yönetimini basitleştirir.
const asyncHandler = require("express-async-handler");

// 'protect' adında bir middleware fonksiyonu tanımlıyoruz. Bu fonksiyon, Express route'larına gelen
// isteklerde kimlik doğrulama authentication işlemini gerçekleştirecek.
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // İsteğin header kısmında 'authorization' alanı olup olmadığını ve
  // bu alanın "Bearer" kelimesi ile başlayıp başlamadığını kontrol ediyoruz.
  // JWT'ler genellikle "Bearer <token>" formatında gönderilir.
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // "Bearer <token>" stringini boşluğa göre ayırıp ikinci elemanı token'ın kendisini alıyoruz.
      token = req.headers.authorization.split(" ")[1];

      // 'jwt.verify' metodu ile tokenı doğruluyoruz.
      // Bu metod, tokenı gizli anahtarı (JWT_SECRET) kullanarak çözer ve doğrular.
      // Eğer token geçersiz veya süresi dolmuşsa bir hata fırlatacaktır.
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Tokendan çözülen 'id' bilgisini kullanarak veri tabanından ilgili kullanıcıyı buluyoruz.
      // '.select("-password")' ile kullanıcı bilgileri çekilirken şifre alanının getirilmemesini sağlıyoruz.
      // Bu güvenlik açısından önemlidir.
      req.user = await User.findById(decoded.id).select("-password");

      // Her şey yolundaysa 'next()' fonksiyonunu çağırarak isteğin bir sonraki adıma genellikle asıl controller fonksiyonuna
      // geçmesini sağlıyoruz.
      next();
    } catch (error) {
      // Eğer token doğrulama sırasında bir hata olursa geçersiz token vs
      // istemciye 401 Unauthorized durum kodu ile bir hata mesajı gönderiyoruz.
      res.status(401);
      throw new Error("Giriş yapılamadı, token geçersiz.");
    }
  }

  // Eğer 'authorization' başlığı yoksa veya "Bearer" ile başlamıyorsa yani token bulunamadıysa
  // yine 401 durum kodu ile bir hata mesajı gönderiyoruz.
  if (!token) {
    res.status(401);
    throw new Error("Giriş yapılamadı, token bulunamadı.");
  }
});

// 'protect' middlewareini dışa aktarıyoruz.
module.exports = { protect };
