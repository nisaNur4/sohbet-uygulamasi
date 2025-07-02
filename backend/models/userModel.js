// Mongoose kütüphanesini projeye dahil ediyoruz. Veri tabanı şemaları ve modelleri için gereklidir.
const mongoose = require("mongoose");
// 'bcryptjs' kütüphanesini dahil ediyoruz. Bu kütüphane, şifreleri güvenli bir şekilde hashlemek şifrelemek  için kullanılır.
const bcrypt = require("bcryptjs");

// 'userSchema' adında yeni bir Mongoose şeması tanımlıyoruz. Bu şema, 'User' (kullanıcı)
// koleksiyonundaki dokümanların yapısını ve kurallarını belirler.
const userSchema = mongoose.Schema(
  {
    // 'name' alanı: Kullanıcının adını saklar.
    // 'type: "String"': Veri tipinin metin olduğunu belirtir.
    // 'required: true': Bu alanın zorunlu olduğunu, boş bırakılamayacağını belirtir.
    name: { type: "String", required: true },

    // 'email' alanı: Kullanıcının e-posta adresini saklar.
    // 'unique: true': Bu alandaki değerin koleksiyon içinde benzersiz unique olması gerektiğini belirtir.
    // 'required: true': Bu alanın zorunlu olduğunu belirtir.
    email: { type: "String", unique: true, required: true },

    // 'password' alanı: Kullanıcının şifresini saklar.
    // 'required: true': Bu alan zorunludur.
    password: { type: "String", required: true },

    // 'pic' alanı: Kullanıcının profil resminin URL'sini saklar.
    // 'default': Eğer bir resim URL'si belirtilmezse varsayılan olarak atanacak olan URL'yi gösterir.
    pic: {
      type: "String",
      required: true,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },

    // 'isAdmin' alanı: Kullanıcının yönetici admin olup olmadığını belirtir.
    // 'type: Boolean': Veri tipinin doğru/yanlış olduğunu belirtir.
    // 'default: false': Varsayılan olarak kullanıcıların yönetici olmadığını belirtir.
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    // 'timestamps: true' seçeneği: Dokümanlar için 'createdAt' ve 'updatedAt' zaman damgalarını otomatik olarak ekler.
    timestamps: true,
  }
);

// 'matchPassword' adında bir şema metodu tanımlıyoruz. Bu metod, bir kullanıcı dokümanı instance üzerinden çağrılabilir.
// Kullanıcının girdiği şifre ile veri tabanında hashlenmiş olarak saklanan şifreyi karşılaştırır.
userSchema.methods.matchPassword = async function (enteredPassword) {
  // 'bcrypt.compare' metodu, girilen şifreyi enteredPassword kullanıcının mevcut şifresiyle this.passwor
  // güvenli bir şekilde karşılaştırır ve sonuç olarak true veya false döner.
  return await bcrypt.compare(enteredPassword, this.password);
};

// 'pre("save")' middleware'i: Bir kullanıcı dokümanı veri tabanına kaydedilmeden 'save' işlemi öncesi
// çalışacak olan bir fonksiyondur. Şifrelerin her zaman hashlenmiş olarak kaydedilmesini sağlar.
userSchema.pre("save", async function (next) {
  // Eğer şifre alanı değiştirilmediyse örneğin sadece e-posta güncelleniyorsa
  // şifreyi tekrar hashlemeye gerek yoktur. 'next()' ile bir sonraki adıma geçilir.
  if (!this.isModified("password")) {
    next();
  }

  // 'bcrypt.genSalt(10)' ile bir 'salt' hashleme işlemine eklenen rastgele bir değer oluşturulur.
  // '10' değeri, hashleme işleminin karmaşıklık seviyesini belirtir.
  const salt = await bcrypt.genSalt(10);
  // Kullanıcının şifresi, oluşturulan 'salt' ile birlikte hashlenir ve yeni değeri 'this.password'a atanır.
  this.password = await bcrypt.hash(this.password, salt);
});

// 'userSchema' şemasını kullanarak "User" adında bir model oluşturuyoruz.
const User = mongoose.model("User", userSchema);

// Oluşturulan 'User' modelini dışa aktarıyoruz.
module.exports = User;
