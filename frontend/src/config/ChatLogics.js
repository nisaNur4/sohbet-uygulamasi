// Bu dosya, sohbet arayüzündeki mesajların görünümünü ve hizalamasını
// belirlemek için kullanılan yardımcı (helper) fonksiyonları içerir.

/**
 * isSameSenderMargin: Mesajın sol boşluğunu (margin) ayarlar.
 * Bu fonksiyon, bir mesajın göndereninin avatarının gösterilip gösterilmeyeceğine
 * ve mesajın hizalamasına göre (sağda veya solda) doğru boşluğu hesaplar.
 * 
 * @param {Array} messages - Tüm mesajların dizisi.
 * @param {Object} m - Mevcut mesaj.
 * @param {Number} i - Mevcut mesajın indeksi.
 * @param {String} userId - Giriş yapmış kullanıcının ID'si.
 * @returns {Number | "auto"} - Sol boşluk değeri.
 */
export const isSameSenderMargin = (messages, m, i, userId) => {
  // Eğer sonraki mesaj da aynı göndericiden geliyorsa ve mesaj bize ait değilse,
  // avatar için 33px boşluk bırak.
  if (
    i < messages.length - 1 &&
    messages[i + 1].sender._id === m.sender._id &&
    messages[i].sender._id !== userId
  )
    return 33;
  // Eğer sonraki mesaj farklı bir göndericiden geliyorsa ve mesaj bize ait değilse,
  // veya bu son mesajsa ve bize ait değilse, avatarın tam hizasında olması için 0 boşluk bırak.
  else if (
    (i < messages.length - 1 &&
      messages[i + 1].sender._id !== m.sender._id &&
      messages[i].sender._id !== userId) ||
    (i === messages.length - 1 && messages[i].sender._id !== userId)
  )
    return 0;
  // Eğer mesaj bize aitse (gönderen bizsek), boşluğu otomatik olarak ayarla (sağa yaslanır).
  else return "auto";
};

/**
 * isSameSender: Bir mesajın avatarının gösterilip gösterilmeyeceğini belirler.
 * Avatar, sadece aynı kullanıcıdan gelen mesaj bloğunun son mesajında gösterilir.
 * 
 * @param {Array} messages - Tüm mesajların dizisi.
 * @param {Object} m - Mevcut mesaj.
 * @param {Number} i - Mevcut mesajın indeksi.
 * @param {String} userId - Giriş yapmış kullanıcının ID'si.
 * @returns {Boolean} - Avatarın gösterilip gösterilmeyeceği.
 */
export const isSameSender = (messages, m, i, userId) => {
  return (
    i < messages.length - 1 &&
    (messages[i + 1].sender._id !== m.sender._id ||
      messages[i + 1].sender._id === undefined) &&
    messages[i].sender._id !== userId
  );
};

/**
 * isLastMessage: Bir mesajın, o göndericinin gönderdiği son mesaj olup olmadığını kontrol eder.
 * 
 * @param {Array} messages - Tüm mesajların dizisi.
 * @param {Number} i - Mevcut mesajın indeksi.
 * @param {String} userId - Giriş yapmış kullanıcının ID'si.
 * @returns {Boolean} - Son mesaj olup olmadığı.
 */
export const isLastMessage = (messages, i, userId) => {
  return (
    i === messages.length - 1 &&
    messages[messages.length - 1].sender._id !== userId &&
    messages[messages.length - 1].sender._id
  );
};

/**
 * isSameUser: Mevcut mesajın bir önceki mesajla aynı kullanıcı tarafından gönderilip gönderilmediğini kontrol eder.
 * Bu, ardışık mesajlar arasındaki dikey boşluğu azaltmak için kullanılır.
 * 
 * @param {Array} messages - Tüm mesajların dizisi.
 * @param {Object} m - Mevcut mesaj.
 * @param {Number} i - Mevcut mesajın indeksi.
 * @returns {Boolean} - Göndericinin aynı olup olmadığı.
 */
export const isSameUser = (messages, m, i) => {
  return i > 0 && messages[i - 1].sender._id === m.sender._id;
};

/**
 * getSender: Bire bir sohbette karşıdaki kullanıcının adını döndürür.
 * 
 * @param {Object} loggedUser - Giriş yapmış kullanıcı.
 * @param {Array} users - Sohbetin kullanıcıları dizisi.
 * @returns {String} - Karşıdaki kullanıcının adı.
 */
export const getSender = (loggedUser, users) => {
  return users[0]?._id === loggedUser?._id ? users[1].name : users[0].name;
};

/**
 * getSenderFull: Bire bir sohbette karşıdaki kullanıcının tüm bilgilerini içeren nesneyi döndürür.
 * 
 * @param {Object} loggedUser - Giriş yapmış kullanıcı.
 * @param {Array} users - Sohbetin kullanıcıları dizisi.
 * @returns {Object} - Karşıdaki kullanıcının tam nesnesi.
 */
export const getSenderFull = (loggedUser, users) => {
  return users[0]._id === loggedUser._id ? users[1] : users[0];
};