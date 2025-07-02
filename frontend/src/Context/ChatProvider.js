// React'ten gerekli kancaları (hooks) import ediyoruz.
// createContext: Yeni bir Context nesnesi oluşturur.
// useContext: Bir Context'in mevcut değerini okur.
// useEffect: Bileşen render edildikten sonra yan etkileri (side effects) çalıştırmak için kullanılır.
// useState: Bileşen içinde state (durum) tutmak için kullanılır.
import React, { createContext, useContext, useEffect, useState } from "react";
// `react-router-dom` v5'te programatik yönlendirme için `useHistory` kancası kullanılır.
import { useHistory } from "react-router-dom";

// Uygulama genelinde paylaşılacak state'ler için bir Context nesnesi oluşturuyoruz.
const ChatContext = createContext();

// `ChatProvider` bileşeni, `ChatContext`'i kullanarak state'leri alt bileşenlere dağıtan bir sarmalayıcıdır.
// `{ children }` prop'u, bu provider'ın sarmaladığı tüm alt bileşenleri temsil eder.
const ChatProvider = ({ children }) => {
  // State tanımlamaları:
  const [selectedChat, setSelectedChat] = useState(); // O an seçili olan sohbeti tutar.
  const [user, setUser] = useState(); // Giriş yapmış olan kullanıcının bilgilerini tutar.
  const [notification, setNotification] = useState([]); // Gelen bildirimleri bir dizi olarak tutar.
  const [chats, setChats] = useState([]); // Kullanıcının dahil olduğu tüm sohbetlerin listesini tutar.

  // useHistory kancasını çağırarak yönlendirme nesnesini alıyoruz.
  const history = useHistory();

  // Bu `useEffect`, bileşen ilk render edildiğinde yalnızca bir kez çalışır.
  // Bağımlılık dizisi `[history]` olarak ayarlanmıştır.
  useEffect(() => {
    // `localStorage`'dan "userInfo" anahtarıyla kaydedilmiş kullanıcı bilgilerini alıyoruz.
    // Bu bilgiler genellikle kullanıcı giriş yaptığında kaydedilir.
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    // Alınan bilgiyi `user` state'ine kaydediyoruz.
    setUser(userInfo);

    // Eğer `localStorage`'da kullanıcı bilgisi bulunmuyorsa (yani kullanıcı giriş yapmamışsa),
    // kullanıcıyı anasayfaya ('/') yönlendiriyoruz.
    if (!userInfo) {
      history.push("/");
    }
  }, [history]); // history nesnesi değiştiğinde (genellikle değişmez) bu effect tekrar çalışır.

  return (
    // `ChatContext.Provider` ile, `value` prop'unda belirttiğimiz tüm state ve fonksiyonları
    // alt bileşenlerin kullanımına sunuyoruz.
    <ChatContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        user,
        setUser,
        notification,
        setNotification,
        chats,
        setChats,
      }}
    >
      {/* Provider'ın sarmaladığı alt bileşenleri (tüm uygulamayı) burada render ediyoruz. */}
      {children}
    </ChatContext.Provider>
  );
};

// `ChatState` adında özel bir kanca (custom hook) oluşturuyoruz.
// Bu, diğer bileşenlerin `useContext(ChatContext)` yazarak context'e erişmesini sağlar.
export const ChatState = () => {
  return useContext(ChatContext);
};

// `ChatProvider` bileşenini dışa aktarıyoruz ki `index.js` dosyasında uygulamayı sarmalamak için kullanılabilsin.
export default ChatProvider;
