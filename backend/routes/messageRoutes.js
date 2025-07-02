// Express kütüphanesini projeye dahil ediyoruz. Yönlendirme (routing) işlemleri için kullanılır.
const express = require("express");

// 'messageControllers.js' dosyasından mesajlarla ilgili controller fonksiyonlarını import ediyoruz.
const {
  allMessages,
  sendMessage,
} = require("../controllers/messageControllers");

// 'authMiddleware.js' dosyasından 'protect' middleware'ini import ediyoruz.
// Bu, route'ları korumak ve sadece kimliği doğrulanmış kullanıcıların erişimine izin vermek için kullanılır.
const { protect } = require("../middleware/authMiddleware");

// Yeni bir Express router nesnesi oluşturuyoruz.
const router = express.Router();

// Route Tanımlamaları:

// '/:chatId' endpoint'i için GET isteği: (allMessages)
// Bu route, belirli bir sohbetin (chatId ile belirtilen) tüm mesajlarını getirmek için kullanılır.
// ':chatId' dinamik bir parametredir, yani URL'de gelen herhangi bir değer 'chatId' olarak kabul edilir.
// Önce 'protect' middleware'i çalışarak kullanıcı kimliğini doğrular, sonra 'allMessages' controller'ı çalışır.
router.route("/:chatId").get(protect, allMessages);

// '/' endpoint'i için POST isteği: (sendMessage)
// Bu route, yeni bir mesaj göndermek için kullanılır. Mesajın içeriği ve hangi sohbete ait olduğu
// gibi bilgiler isteğin gövdesinde (request body) gönderilir.
// 'protect' middleware'i ile korunur, ardından 'sendMessage' controller'ı mesajı işler.
router.route("/").post(protect, sendMessage);

// Oluşturduğumuz router'ı dışa aktarıyoruz.
module.exports = router;
