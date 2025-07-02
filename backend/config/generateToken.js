// JSON Web Token (JWT) kütüphanesini projeye dahil ediyoruz. JWT, kullanıcıların kimliğini doğrulamak ve
// güvenli bir şekilde bilgi alışverişi yapmak için kullanılan popüler bir standarttır.
const jwt = require("jsonwebtoken");

// 'generateToken' adında bir fonksiyon tanımlıyoruz. Bu fonksiyon, kullanıcıya özel bir JWT oluşturmak için kullanılır.
// Parametre olarak kullanıcının benzersiz kimliğini (id) alır.
const generateToken = (id) => {
  // 'jwt.sign' metodu ile yeni bir token oluşturuyoruz.
  // Bu metoda üç temel parametre verilir:
  // 1. Payload (veri): Token içinde saklanacak olan veridir. Burada sadece kullanıcının 'id' bilgisini saklıyoruz.
  //    Bu 'id', daha sonra token doğrulandığında tekrar elde edilebilir.
  // 2. Secret Key (gizli anahtar): Token'ı imzalamak için kullanılan gizli bir anahtardır.
  //    Bu anahtar, '.env' dosyasından 'JWT_SECRET' değişkeni ile alınır. Bu anahtarın gizli kalması çok önemlidir,
  //    çünkü token'ların güvenliği bu anahtara bağlıdır.
  // 3. Options (seçenekler): Token'ın geçerlilik süresi gibi ek ayarları içerir.
  //    Burada 'expiresIn: "30d"' ifadesiyle token'ın 30 gün boyunca geçerli olacağını belirtiyoruz.
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// 'generateToken' fonksiyonunu, projenin diğer dosyalarında da kullanılabilmesi için dışa aktarıyoruz.
// Bu sayede, kullanıcı girişi veya kaydı gibi işlemlerde bu fonksiyonu çağırarak token üretebiliriz.
module.exports = generateToken;