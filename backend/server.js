// Express: Node.js için web uygulama çatısı. Sunucu oluşturma ve yönlendirme (routing) işlemlerini yönetir.
const express = require("express");
// connectDB: Kendi oluşturduğumuz ve veri tabanı bağlantısını yöneten fonksiyon.
const connectDB = require("./config/db");
// dotenv: Ortam değişkenlerini (environment variables) .env dosyasından yüklemek için kullanılır.
const dotenv = require("dotenv");
// userRoutes, chatRoutes, messageRoutes: Farklı API endpoint'leri için oluşturduğumuz yönlendirme (router) dosyaları.
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
// errorMiddleware: Hata yönetimi için kendi oluşturduğumuz middleware'ler (404 Not Found ve genel hata yakalayıcı).
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
// path: Dosya ve dizin yollarıyla çalışmak için Node.js'in dahili modülü.
const path = require("path");

// Ortam değişkenlerini yükle (.env dosyasını oku).
dotenv.config();
// Veri tabanı bağlantısını başlat.
connectDB();
// Express uygulamasını oluştur.
const app = express();

// app.use(express.json()): Gelen isteklerin (request) gövdesinde gönderilen JSON verilerini
// ayrıştırmak (parse) ve req.body nesnesine eklemek için kullanılan bir middleware.
app.use(express.json());

// API Rotaları 
// Belirli bir yol (path) için hangi router'ın kullanılacağını Express'e bildiriyoruz.
// '/api/user' ile başlayan tüm istekler 'userRoutes' tarafından işlenecek.
app.use("/api/user", userRoutes);
// '/api/chat' ile başlayan tüm istekler 'chatRoutes' tarafından işlenecek.
app.use("/api/chat", chatRoutes);
// '/api/message' ile başlayan tüm istekler 'messageRoutes' tarafından işlenecek.
app.use("/api/message", messageRoutes);

// Üretim Ortamı İçin Dağıtım (Deployment) 
// Bu bölüm, uygulama üretim (production) modunda çalışırken yani canlıya alındığında
// build edilmiş frontend (React) uygulamasını sunmak için kullanılır.

const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
  // Frontend'in build klasörünü statik bir klasör olarak sun.
  app.use(express.static(path.join(__dirname1, "/frontend/build")));

  // API rotaları dışında gelen tüm GET isteklerini yakala ve
  // frontend'in ana HTML dosyası olan 'index.html'i gönder.
  // Bu, React Router gibi client-side yönlendirme kütüphanelerinin düzgün çalışmasını sağlar.
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
  );
} else {
  // Eğer geliştirme ortamındaysak, kök dizine ('/') gelen bir isteğe basit bir cevap ver.
  app.get("/", (req, res) => {
    res.send("API başarıyla çalışıyor.");
  });
}

// Hata Yönetimi Middlewareleri
// Bu middleware'ler en sonda tanımlanmalıdır ki yukarıdaki rotalarda oluşacak hataları yakalayabilsinler.
// notFound: Eşleşen bir rota bulunamadığında çalışır.
app.use(notFound);
// errorHandler: Herhangi bir rotada hata oluştuğunda çalışır.
app.use(errorHandler);

// Sunucunun çalışacağı port numarasını .env dosyasından al.
const PORT = process.env.PORT;

// Eğer bu dosya doğrudan çalıştırıldıysa (yani 'require' ile import edilmediyse) sunucuyu başlat.
// Bu, test dosyalarımızın uygulamayı import ettiğinde sunucunun otomatik olarak başlamasını önler.
if (require.main === module) {
const server = app.listen(
  PORT,
  console.log(`Sunucu ${PORT} portunda çalışıyor...`.yellow.bold)
);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("Socket.io'ya bağlanıldı.");
    let userData;

  socket.on("setup", (data) => {
      userData = data;
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("Kullanıcı Odaya Katıldı: " + room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users tanımlı değil");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;
      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.on("disconnect", () => {
      if (userData) {
          console.log("KULLANICI BAĞLANTISI KESİLDİ");
          socket.leave(userData._id);
      }
  });
});
}

// Testlerin uygulamaya erişebilmesi için app'i dışa aktar.
module.exports = app;
