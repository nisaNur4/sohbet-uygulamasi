// Mongoose kütüphanesini projeye dahil ediyoruz. Mongoose, MongoDB ve Node.js arasında bir köprü görevi görerek
// veri tabanı işlemlerini daha kolay ve yönetilebilir hale getirir.
const mongoose = require("mongoose");

// 'colors' kütüphanesini dahil ediyoruz. Bu kütüphane, konsol loglarına renk ekleyerek
// okunabilirliği artırır ve geliştirme sürecini daha keyifli hale getirir.
const colors = require("colors");

// 'connectDB' adında asenkron bir fonksiyon tanımlıyoruz. Bu fonksiyon, veri tabanı bağlantısını kurmak için kullanılacak.
// Asenkron olmasının sebebi, veri tabanı bağlantısının zaman alabilen bir işlem olması ve programın bu sırada
// diğer işlemlere devam edebilmesini sağlamaktır.
const connectDB = async () => {
  try {
    // Mongoose'un 'connect' metodunu kullanarak MongoDB veri tabanına bağlanmaya çalışıyoruz.
    // Bağlantı adresi (URI), '.env' dosyasında tanımlanan 'MONGO_URI' değişkeninden alınır.
    // Bu, güvenlik ve yapılandırma esnekliği açısından önemlidir.
    const conn = await mongoose.connect(process.env.MONGO_URI, {});

    // Bağlantı başarılı olduğunda konsola bağlantının kurulduğu ana makine (host) bilgisini
    // renkli ve altı çizili bir şekilde yazdırıyoruz. Bu, geliştiriciye bağlantının başarılı
    // olduğuna dair görsel bir geri bildirim sağlar.
    console.log(`MongoDB Bağlantısı Başarılı: ${conn.connection.host}`.cyan.underline);
  } catch (error) {
    // Eğer bağlantı sırasında bir hata oluşursa, bu 'catch' bloğu çalışır.
    // Hata mesajını konsola kırmızı ve kalın bir şekilde yazdırarak, sorunun ne olduğunu
    // net bir şekilde görmemizi sağlar.
    console.error(`MongoDB Bağlantı Hatası: ${error.message}`.red.bold);
    console.log("Uygulama MongoDB olmadan çalışmaya devam edecek...".yellow);

    // Hata durumunda uygulamayı sonlandırmak yerine, sadece uyarı veriyoruz
    // process.exit(1);
  }
};

// 'connectDB' fonksiyonunu, projenin başka dosyalarında da kullanılabilmesi için dışa aktarıyoruz.
// 'module.exports', Node.js'de bir modülün dışa aktarılmasını sağlayan standart bir yöntemdir.
module.exports = connectDB;

