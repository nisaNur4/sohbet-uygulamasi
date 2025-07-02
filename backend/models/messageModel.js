// Mongoose kütüphanesini projeye dahil ediyoruz. Veri tabanı şemalarını ve modellerini oluşturmak için gereklidir.
const mongoose = require("mongoose");

// 'messageSchema' adında yeni bir Mongoose şeması tanımlıyoruz. Bu şema, 'Message' 
// koleksiyonundaki dokümanların yapısını belirler.
const messageSchema = mongoose.Schema(
  {
    // 'sender' alanı: Mesajı gönderen kullanıcıyı belirtir.
    // 'type: mongoose.Schema.Types.ObjectId': Bu alanın, başka bir dokümanın kimliği (ID) olacağını ifade eder.
    // 'ref: "User"': Bu kimliğin 'User'  modeline bir referans olduğunu gösterir.
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // 'content' alanı: Mesajın içeriğini, yani metnini saklar.
    // 'type: String': Veri tipinin String olacağını belirtir.
    // 'trim: true': Metnin başındaki ve sonundaki gereksiz boşlukları temizler.
    content: { type: String, trim: true },

    // 'chat' alanı: Mesajın hangi sohbete ait olduğunu belirtir.
    // 'type: mongoose.Schema.Types.ObjectId': Bu alanın bir doküman kimliği olacağını belirtir.
    // 'ref: "Chat"': Bu kimliğin 'Chat' modeline bir referans olduğunu gösterir.
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },

    // 'readBy' alanı: Mesajı okuyan kullanıcıları bir array içinde tutar.
    // 'type: mongoose.Schema.Types.ObjectId': Dizideki her elemanın bir kullanıcı kimliği olacağını belirtir.
    // 'ref: "User"': Bu kimliklerin 'User' modeline referans verdiğini gösterir.
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    // 'timestamps: true' seçeneği: Mongoose'un her doküman için 'createdAt' oluşturulma tarihi
    // ve 'updatedAt' güncellenme tarih alanlarını otomatik olarak yönetmesini sağlar.
    timestamps: true,
  }
);

// 'messageSchema' şemasını kullanarak "Message" adında bir model oluşturuyoruz.
// Bu model, veri tabanındaki 'Message' koleksiyonu ile etkileşim kurmak için kullanılacak.
const Message = mongoose.model("Message", messageSchema);

// Oluşturulan 'Message' modelini, projenin diğer dosyalarında da kullanılabilmesi için dışa aktarıyoruz.
module.exports = Message;
