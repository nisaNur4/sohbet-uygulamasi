// Express kütüphanesini projeye dahil ediyoruz.
const express = require("express");

// 'userControllers.js' dosyasından kullanıcı işlemleriyle ilgili controller fonksiyonlarını import ediyoruz.
const {
  registerUser,
  authUser,
  allUsers,
} = require("../controllers/userControllers");

// 'authMiddleware.js' dosyasından 'protect' middleware'ini import ediyoruz.
// Bu middleware, belirli route'ları sadece giriş yapmış kullanıcıların erişimine açar.
const { protect } = require("../middleware/authMiddleware");

// Yeni bir Express router nesnesi oluşturuyoruz.
const router = express.Router();

// Route Tanımlamaları:

// '/' endpoint'i için GET isteği: (allUsers)
// Bu route, kullanıcıları aramak için kullanılır (örneğin, sohbete eklemek için).
// 'protect' middleware'i sayesinde sadece giriş yapmış bir kullanıcı diğer kullanıcıları arayabilir.
// 'allUsers' controller'ı, arama kriterlerine göre kullanıcıları bulur ve listeler.
router.route("/").get(protect, allUsers);

// '/' endpoint'i için POST isteği: (registerUser)
// Bu route, yeni bir kullanıcı kaydı (signup) oluşturmak için kullanılır.
// 'registerUser' controller'ı, istek gövdesinden gelen kullanıcı bilgilerini (ad, e-posta, şifre)
// alarak yeni bir kullanıcı oluşturur. Bu route'da 'protect' kullanılmamıştır çünkü
// henüz giriş yapmamış bir kişi de kayıt olabilmelidir.
router.route("/").post(registerUser);

// '/login' endpoint'i için POST isteği: (authUser)
// Bu route, mevcut bir kullanıcının sisteme giriş yapması (login) için kullanılır.
// 'authUser' controller'ı, e-posta ve şifre ile kimlik doğrulaması yapar ve başarılı olursa
// bir token  oluşturarak kullanıcıya geri döner.
router.post("/login", authUser);

// Oluşturduğumuz router'ı dışa aktarıyoruz.
module.exports = router;
