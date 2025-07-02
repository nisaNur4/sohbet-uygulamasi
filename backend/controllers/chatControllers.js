// 'express-async-handler', Express'teki asenkron route handler'larda hata yönetimini kolaylaştırır.
// try-catch blokları yerine bu sarmalayıcıyı kullanarak hataların otomatik olarak Express'in
// hata yakalama middleware'ine iletilmesini sağlarız.
const asyncHandler = require("express-async-handler");
// 'Chat' ve 'User' modellerini import ediyoruz. Veri tabanı işlemleri için bu modellere ihtiyacımız var.
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

/**
 * @desc    Birebir sohbet oluşturur veya mevcutsa erişim sağlar.
 * @route   POST /api/chat/
 * @access  Private 
 */
const accessChat = asyncHandler(async (req, res) => {
  // İstek gövdesinden sohbet başlatılmak istenen kullanıcının ID'sini ('userId') alıyoruz.
  const { userId } = req.body;

  // Eğer 'userId' gönderilmemişse bu bir hatadır.
  if (!userId) {
    console.log("İstekle birlikte kullanıcı kimliği (userId) parametresi gönderilmedi.");
    // 400 Bad Request durum kodu ile işlemi sonlandırıyoruz.
    return res.sendStatus(400);
  }

  // İki kullanıcı arasında giriş yapmış olan kullanıcı ve 'userId' ile belirtilen kullanıcı
  // daha önceden oluşturulmuş bir birebir sohbet olup olmadığını kontrol ediyoruz.
  var isChat = await Chat.find({
    isGroupChat: false, // Grup sohbeti olmamalı.
    $and: [ // ve operatörü: her iki koşul da doğru olmalı.
      // 'users' dizisinde giriş yapmış kullanıcının ID'si olmalı.
      { users: { $elemMatch: { $eq: req.user._id } } },
      // 'users' dizisinde diğer kullanıcının ID'si olmalı.
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    // 'populate' metodu, referansla bağlanmış dokümanların gerçek verilerini getirmemizi sağlar.
    // 'users' alanındaki kullanıcı ID'leri yerine, kullanıcıların tam dökümanlarını, şifre hariç, getirir.
    .populate("users", "-password")
    // Varsa, son mesajın bilgilerini de getirir.
    .populate("latestMessage");

  // Mevcut sohbetin son mesajını gönderen kullanıcının bilgilerini de (isim, resim, email) getiriyoruz.
  // Bu, iç içe populate işlemidir.
  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  // Eğer aranan kriterlere uygun bir sohbet bulunduysa 
  if (isChat.length > 0) {
    // Mevcut sohbeti istemciye gönderiyoruz.
    res.send(isChat[0]);
  } else {
    // Eğer mevcut bir sohbet yoksa yeni bir sohbet oluşturuyoruz.
    var chatData = {
      chatName: "sender", // Birebir sohbetlerde genellikle bir isim kullanılmaz, bu değerin önemi az.
      isGroupChat: false,
      users: [req.user._id, userId], // Sohbete iki kullanıcıyı da ekliyoruz.
    };

    try {
      // 'Chat.create' ile veri tabanında yeni sohbet dokümanını oluşturuyoruz.
      const createdChat = await Chat.create(chatData);
      // Oluşturulan sohbeti, kullanıcı bilgileriyle birlikte tam olarak çekiyoruz.
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      // 200 OK durum kodu ve oluşturulan sohbet bilgisiyle cevap dönüyoruz.
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

/**
 * @desc    Giriş yapmış kullanıcının dahil olduğu tüm sohbetleri getirir.
 * @route   GET /api/chat/
 * @access  Private
 */
const fetchChats = asyncHandler(async (req, res) => {
  try {
    // 'Chat' koleksiyonunda, 'users' dizisinde giriş yapmış kullanıcının ID'sini içeren tüm sohbetleri buluyoruz.
    const results = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password") // Kullanıcı bilgilerini getir.
      .populate("groupAdmin", "-password") // Grup yöneticisi bilgisini getir.
      .populate("latestMessage") // Son mesaj bilgisini getir.
      .sort({ updatedAt: -1 }); // Sohbetleri son güncellenme tarihine göre (en yeniden en eskiye) sırala.
      
    // Son mesajı gönderen kullanıcının bilgilerini de ekle.
    const populatedResults = await User.populate(results, {
        path: "latestMessage.sender",
        select: "name pic email",
    });
    // 200 OK durum kodu ve bulunan sohbet listesiyle cevap dön.
    res.status(200).send(populatedResults);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

/**
 * @desc    Yeni bir grup sohbeti oluşturur.
 * @route   POST /api/chat/group
 * @access  Private
 */
const createGroupChat = asyncHandler(async (req, res) => {
  // İstek gövdesinde kullanıcı listesi 'users' ve grup adı 'name' olup olmadığını kontrol et.
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Lütfen tüm alanları doldurun." });
  }

  // 'req.body.users' genellikle frontend'den JSON string'i olarak gelir. Bunu parse ederek bir JavaScript dizisine çeviririz.
  var users = JSON.parse(req.body.users);

  // Bir grup sohbeti için giriş yapan kullanıcı hariç en az 2 kullanıcı gereklidir.
  if (users.length < 2) {
    return res
      .status(400)
      .send("Grup sohbeti oluşturmak için 2'den fazla kullanıcı gereklidir.");
  }

  // Ggiriş yapmış olan, grubu oluşturan kullanıcıyı da kullanıcı listesine ekle.
  users.push(req.user);

  try {
    // Veri tabanında yeni grup sohbetini oluştur.
    const groupChat = await Chat.create({
      chatName: req.body.name, // Grup adı
      users: users, // Kullanıcı listesi
      isGroupChat: true, // Bunun bir grup sohbeti olduğunu belirt.
      groupAdmin: req.user, // Grubu oluşturan kişiyi yönetici olarak ata.
    });

    // Oluşturulan grup sohbetini, kullanıcı ve yönetici bilgileriyle birlikte tam olarak çek.
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    // 200 OK durum kodu ve oluşturulan grup bilgisiyle cevap dön.
    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

/**
 * @desc    Bir grup sohbetinin adını günceller.
 * @route   PUT /api/chat/rename
 * @access  Private
 */
const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  // 'findByIdAndUpdate' metodu ile belirtilen ID'ye sahip sohbeti bul ve güncelle.
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: chatName, // chatName alanını yeni değerle güncelle.
    },
    {
      new: true, // Bu seçenek, metodun güncelleme sonrası dokümanın yeni halini döndürmesini sağlar.
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  // Eğer belirtilen ID'de bir sohbet bulunamazsa veya güncellenemezse 'updatedChat' null olur.
  if (!updatedChat) {
    res.status(404);
    throw new Error("Sohbet Bulunamadı!!");
  } else {
    // Başarılı olursa güncellenmiş sohbet bilgisini gönder.
    res.json(updatedChat);
  }
});

/**
 * @desc    Bir kullanıcıyı gruptan çıkarır.
 * @route   PUT /api/chat/groupremove
 * @access  Private
 */
const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // '$pull' operatörü, bir diziden belirtilen koşula uyan değeri kaldırır.
  // Burada 'users' dizisinden belirtilen 'userId'yi kaldırıyoruz.
  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404);
    throw new Error("Sohbet Bulunamadı!!");
  } else {
    res.json(removed);
  }
});

/**
 * @desc    Gruba yeni bir kullanıcı ekler.
 * @route   PUT /api/chat/groupadd
 * @access  Private
 */
const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // '$push' operatörü, bir diziye yeni bir eleman ekler.
  // Burada 'users' dizisine yeni 'userId'yi ekliyoruz.
  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404);
    throw new Error("Sohbet Bulunamadı!!");
  } else {
    res.json(added);
  }
});

// Tanımlanan tüm controller fonksiyonlarını dışa aktarıyoruz.
module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
