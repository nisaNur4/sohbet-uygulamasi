// Asenkron Express route handlerları için hata yönetimini kolaylaştıran yardımcı
const asyncHandler = require("express-async-handler");
// User modelini ve token oluşturma fonksiyonunu import ediyoruz.
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");

/**
 * @desc    Kullanıcıları arama kriterine göre arar ve listeler.
 * @route   GET /api/user?search=...
 * @access  Private
 */
const allUsers = asyncHandler(async (req, res) => {
  // URL'deki sorgu parametrelerinden 'search' anahtar kelimesini alıyoruz.
  // Örnek: /api/user?search=nisa
  const keyword = req.query.search
    ? {
        // Eğer 'search' anahtar kelimesi vars, bir arama objesi oluştur.
        $or: [
          // 'name' alanında anahtar kelimeyi içeren ,büyük/küçük harf duyarsız, kullanıcıları bul.
          { name: { $regex: req.query.search, $options: "i" } },
          // veya 'email' alanında anahtar kelimeyi içeren kullanıcıları bul.
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {}; // Eğer 'search' anahtar kelimesi yoksa boş bir obje ile tüm kullanıcıları hedefle.

  // Veri tabanında arama yapıyoruz.
  // 'find(keyword)' ile arama kriterini uyguluyoruz.
  // '.find({ _id: { $ne: req.user._id } })' ile sonuçlardan o an giriş yapmış olan kullanıcının
  // kendisini çıkarıyoruz, böylece kişi kendi kendine sohbet başlatamaz.
  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  // Bulunan kullanıcı listesini istemciye gönderiyoruz.
  res.send(users);
});

/**
 * @desc    Yeni bir kullanıcı kaydı oluşturur.
 * @route   POST /api/user
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  // İstek gövdesinden kullanıcı bilgilerini alıyoruz.
  const { name, email, password, pic } = req.body;

  // İsim, e-posta veya şifre alanlarından herhangi biri boşsa hata döndür.
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Lütfen tüm zorunlu alanları doldurun.");
  }

  // Bu e-posta adresine sahip bir kullanıcı veri tabanında zaten var mı, diye kontrol et.
  const userExists = await User.findOne({ email });

  // Eğer kullanıcı zaten varsa hata döndür.
  if (userExists) {
    res.status(400);
    throw new Error("Bu e-posta adresi zaten kullanılmaktadır.");
  }

  // 'User.create' ile veri tabanında yeni kullanıcıyı oluştur.
  // Şifre, userModel'deki 'pre("save")' middleware'i sayesinde otomatik olarak hashlenecektir.
  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  // Eğer kullanıcı başarıyla oluşturulduysa
  if (user) {
    // 201 Created durum kodu ile birlikte kullanıcı bilgilerini ve bir JWT'yi istemciye gönder.
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id), // Kullanıcı ID'si ile yeni bir token oluştur.
    });
  } else {
    // Eğer kullanıcı oluşturulamadıysa  hata döndür.
    res.status(400);
    throw new Error("Kullanıcı oluşturulamadı.");
  }
});

/**
 * @desc    Kullanıcının giriş yapmasını (kimlik doğrulamasını) sağlar.
 * @route   POST /api/user/login
 * @access  Public
 */
const authUser = asyncHandler(async (req, res) => {
  // İstek gövdesinden e-posta ve şifreyi al.
  const { email, password } = req.body;

  // Veri tabanında bu e-postaya sahip kullanıcıyı bul.
  const user = await User.findOne({ email });

  // Eğer kullanıcı bulunduysa VE girilen şifre, veri tabanındaki hashenmiş şifre ile eşleşiyorsa
  // 'user.matchPassword(password)' metodu userModel'de tanımlanmıştır.
  if (user && (await user.matchPassword(password))) {
    // Kullanıcı bilgilerini ve yeni bir token'ı istemciye gönder.
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    // Eğer kullanıcı bulunamazsa veya şifre yanlışsa, 401 Unauthorized hatası döndür.
    res.status(401);
    throw new Error("Geçersiz E-posta veya Şifre.");
  }
});

// Controller fonksiyonlarını dışa aktarıyoruz.
module.exports = { allUsers, registerUser, authUser };
