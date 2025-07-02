// Asenkron Express route handlerları için hata yönetimini kolaylaştıran yardımcı.
const asyncHandler = require("express-async-handler");
// Veri tabanı işlemleri için gerekli olan Modelleri import ediyoruz.
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

/**
 * @desc   Bir sohbete ait tüm mesajları getirir.
 * @route   GET /api/message/:chatId
 * @access  Private
 */
const allMessages = asyncHandler(async (req, res) => {
  try {
    // 'Message' modelini kullanarak belirli bir sohbete ait olan tüm mesajları buluyoruz.
    // Sohbet ID'si route parametresi olarak 'req.params.chatId' üzerinden alınır.
    const messages = await Message.find({ chat: req.params.chatId })
      // 'sender' alanını populate ederek mesajı gönderen kullanıcının
      // ad, profil resmi ve e-posta bilgilerini mesaja dahil ediyoruz.
      .populate("sender", "name pic email")
      // 'chat' alanını populate edereksohbetin kendi bilgilerini de mesaja dahil ediyoruz.
      .populate("chat");
    // Bulunan mesajları JSON formatında istemciye gönderiyoruz.
    res.json(messages);
  } catch (error) {
    // Bir hata oluşursa 400 durum kodu ile hata mesajını fırlatıyoruz.
    res.status(400);
    throw new Error(error.message);
  }
});

/**
 * @desc    Yeni bir mesaj oluşturur ve gönderir.
 * @route   POST /api/message/
 * @access  Private
 */
const sendMessage = asyncHandler(async (req, res) => {
  // İstek gövdesinden mesajın içeriğini 'content' ve ait olduğu sohbetin ID'sini chatId' alıyoruz.
  const { content, chatId } = req.body;

  // 'content' veya 'chatId' eksikse bu geçersiz bir istektir.
  if (!content || !chatId) {
    console.log("İsteğe geçersiz veri iletildi.");
    return res.sendStatus(400);
  }

  // Veri tabanına kaydedilecek yeni mesaj nesnesini hazırlıyoruz.
  var newMessage = {
    sender: req.user._id, // Mesajı gönderen, o an giriş yapmış olan kullanıcıdır.
    content: content,      // Mesajın içeriği
    chat: chatId,          // Mesajın ait olduğu sohbet
  };

  try {
    // 'Message.create' ile veri tabanında yeni mesaj dokümanını oluşturuyoruz.
    var message = await Message.create(newMessage);

    // Oluşturulan mesajın referans alanlarını dolduruyoruz (populate).
    // Doğrudan await ve .populate() kullanıyoruz.
    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    // Sohbetin 'latestMessage' son mesaj alanını, yeni gönderilen bu mesajla güncelliyoruz.
    // Bu, sohbet listesinde son mesajı gösterebilmek için önemlidir.
    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    // Tamamen doldurulmuş populated mesaj nesnesini istemciye gönderiyoruz.
    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// Controller fonksiyonlarını dışa aktarıyoruz.
module.exports = { allMessages, sendMessage };
