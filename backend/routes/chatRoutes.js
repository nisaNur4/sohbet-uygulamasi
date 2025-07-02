// Express kütüphanesini projeye dahil ediyoruz. Express, Node.js için popüler bir web uygulama çerçevesidir
// yönlendirme routing işlemlerini kolaylaştırır.
const express = require("express");

// 'chatControllers.js' dosyasından sohbetle ilgili controller fonksiyonlarını import ediyoruz.
// Bu fonksiyonlar, belirli bir route'a istek geldiğinde çalışacak olan asıl iş mantığını içerir.
const {
  accessChat,      // Birebir sohbet başlatma veya mevcut sohbeti getirme
  fetchChats,      // Kullanıcının dahil olduğu tüm sohbetleri getirme
  createGroupChat, // Yeni bir grup sohbeti oluşturma
  removeFromGroup, // Gruptan bir kullanıcıyı çıkarma
  addToGroup,      // Gruba yeni bir kullanıcı ekleme
  renameGroup,     // Grubun adını değiştirme
} = require("../controllers/chatControllers");

// 'authMiddleware.js' dosyasından 'protect' middleware'ini import ediyoruz.
// Bu middleware, bir route'a erişim sağlamadan önce kullanıcının kimliğinin doğrulanmasını authentication sağlar.
// Sadece giriş yapmış kullanıcıların belirli işlemleri yapabilmesini garanti eder.
const { protect } = require("../middleware/authMiddleware");

// Express'in Router sınıfını kullanarak yeni bir router nesnesi oluşturuyoruz.
// Router, belirli bir yol path altındaki tüm routeları gruplamamızı sağlar.
const router = express.Router();

// Route tanımlamaları:
// Bir route, bir HTTP metodu (GET, POST, PUT, DELETE vb.), bir URI (veya path) ve
// bu isteği işleyecek en az bir fonksiyondan (handler) oluşur.

// '/' endpoint'i için POST isteği: Birebir sohbet oluşturur veya erişir. (accessChat)
// 'protect' middleware'i önce çalışır, kullanıcı doğrulanırsa 'accessChat' controller'ı devreye girer.
router.route("/").post(protect, accessChat);

// '/' endpoint'i için GET isteği: Giriş yapmış kullanıcının tüm sohbetlerini getirir. (fetchChats)
router.route("/").get(protect, fetchChats);

// '/group' endpoint'i için POST isteği: Yeni bir grup sohbeti oluşturur. (createGroupChat)
router.route("/group").post(protect, createGroupChat);

// '/rename' endpoint'i için PUT isteği: Bir grup sohbetinin adını günceller. (renameGroup)
router.route("/rename").put(protect, renameGroup);

// '/groupremove' endpoint'i için PUT isteği: Bir kullanıcıyı gruptan çıkarır. (removeFromGroup)
router.route("/groupremove").put(protect, removeFromGroup);

// '/groupadd' endpoint'i için PUT isteği: Bir kullanıcıyı gruba ekler. (addToGroup)
router.route("/groupadd").put(protect, addToGroup);

// Oluşturduğumuz router'ı, projenin ana dosyasında (server.js) kullanılabilmesi için dışa aktarıyoruz.
module.exports = router;
