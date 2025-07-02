// Mongoose kütüphanesini projeye dahil ediyoruz. Veri tabanı şemaların ve modellerini oluşturmak için kullanılır.
const mongoose = require("mongoose");

// 'chatModel' adında bir Mongoose şeması oluşturuyoruz. Bu şema, 'Chat' koleksiyonundaki
// dokümanların yapısını ve kurallarını tanımlar.
const chatModel = mongoose.Schema(
  {
    // 'chatName' alanı: Sohbetin adını saklar.
    // 'type: String': Veri tipinin String olacağını belirtir.
    // 'trim: true': Metnin başındaki ve sonundaki boşlukları otomatik olarak temizler.
    chatName: { type: String, trim: true },

    // 'isGroupChat' alanı: Sohbetin bir grup sohbeti olup olmadığını belirtir.
    // 'type: Boolean': Veri tipinin doğru/yanlış olacağını belirtir.
    // 'default: false': Eğer bir değer atanmazsa varsayılan olarak 'false' yani bireysel sohbet kabul edilir.
    isGroupChat: { type: Boolean, default: false },

    // 'users' alanı: Sohbete dahil olan kullanıcıları bir array içinde saklar.
    // 'type: mongoose.Schema.Types.ObjectId': Her bir elemanın, başka bir Mongoose dökümanının kimliği (ID) olacağını belirtir.
    // 'ref: "User"': Bu kimliklerin 'User' modeline referans verdiğini, yani kullanıcı dokümanlarına ait olduğunu gösterir.
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // 'latestMessage' alanı: Sohbetteki en son gönderilen mesajı saklar.
    // 'type: mongoose.Schema.Types.ObjectId': Bu alanın da bir doküman kimliği olacağını belirtir.
    // 'ref: "Message"': Bu kimliğin 'Message' modeline referans verdiğini gösterir.
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },

    // 'groupAdmin' alanı: Eğer bu bir grup sohbetiyse grup yöneticisini saklar.
    // 'type: mongoose.Schema.Types.ObjectId': Yöneticinin kimliğini tutar.
    // 'ref: "User"': Bu kimliğin 'User' modeline ait olduğunu belirtir.
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    // 'timestamps: true' seçeneği: Mongoose'a bu şemaya sahip dokümanlar için iki yeni alan eklemesini söyler:
    // 'createdAt': Dokümanın oluşturulma tarihini otomatik olarak kaydeder.
    // 'updatedAt': Dokümanın son güncellenme tarihini otomatik olarak kaydeder.
    timestamps: true,
  }
);

// 'mongoose.model' metodu ile 'chatModel' şemasını kullanarak "Chat" adında bir model oluşturuyoruz.
// Model, veri tabanı ile etkileşim kurmamızı sağlayan arayüzdür oluşturma, okuma, güncelleme, silme işlemleri vs.
const Chat = mongoose.model("Chat", chatModel);

// Oluşturduğumuz 'Chat' modelini, projenin başka yerlerinde kullanabilmek için dışa aktarıyoruz.
module.exports = Chat;