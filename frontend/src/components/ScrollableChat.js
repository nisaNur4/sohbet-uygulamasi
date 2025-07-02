// Chakra UI'dan `Avatar` ve `Tooltip` bileşenlerini import ediyoruz.
import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
// `react-scrollable-feed`, yeni mesaj geldiğinde sohbeti otomatik olarak en alta kaydıran kullanışlı bir kütüphane.
import ScrollableFeed from "react-scrollable-feed";
// `ChatLogics` içerisinden mesajların hizalanması ve gruplanması için gerekli yardımcı fonksiyonları import ediyoruz.
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
// Global state'e erişim için `ChatState` hook'unu import ediyoruz.
import { ChatState } from "../Context/ChatProvider";

// `ScrollableChat` bileşeni, gelen mesajları bir liste halinde gösterir ve bu listenin kaydırılabilir olmasını sağlar.
const ScrollableChat = ({ messages }) => {
  // Global state'ten o anki kullanıcı (user) bilgisini alıyoruz.
  const { user } = ChatState();

  return (
    // `ScrollableFeed`, içeriği (yani mesajları) sarmalar ve yeni içerik eklendiğinde otomatik olarak aşağı kaydırır.
    <ScrollableFeed>
      {/*
        `messages` dizisi varsa ve boş değilse, her bir mesaj (m) için bir `map` fonksiyonu çalıştırırız.
        `i` burada mesajın dizideki indeksidir.
      */}
      {messages &&
        messages.map((m, i) => (
          <div style={{ display: "flex" }} key={m._id}>
            {/*
              Bu kısım, mesaj gönderenin avatarını gösterip göstermeyeceğimizi belirler.
              Avatar sadece şu iki durumda gösterilir:
              1. `isSameSender`: Mevcut mesaj, bir önceki mesajla aynı göndericiye ait DEĞİLSE.
                 Bu, aynı kullanıcıdan gelen ardışık mesajların yanında avatarın tekrarlanmasını önler.
              2. `isLastMessage`: Mevcut mesaj, o göndericinin gönderdiği son mesajsa.
                 Bu, kullanıcının son mesajının yanında avatarının görünmesini sağlar.
            */}
            {(isSameSender(messages, m, i, user._id) ||
              isLastMessage(messages, i, user._id)) && (
              // `Tooltip`, fare ile üzerine gelindiğinde gönderenin adını gösterir.
              <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
                <Avatar
                  mt="7px"
                  mr={1}
                  size="sm"
                  cursor="pointer"
                  name={m.sender.name}
                  src={m.sender.pic}
                />
              </Tooltip>
            )}
            {/* Mesaj içeriğini gösteren `span` elementi */}
            <span
              style={{
                // Arka plan rengini belirle:
                // Eğer mesajı gönderen mevcut kullanıcı ise açık mavi, değilse açık yeşil yap.
                backgroundColor: `${
                  m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
                }`,
                // Mesajın soldan ne kadar boşluk bırakacağını belirle.
                // Bu, karşı tarafın mesajlarını sola, bizimkileri sağa yaslamak için kullanılır.
                marginLeft: isSameSenderMargin(messages, m, i, user._id),
                // Ardışık mesajlar arasındaki dikey boşluğu ayarla.
                // Eğer bir önceki mesajla aynı kullanıcıdan geliyorsa daha az (3px),
                // farklı bir kullanıcıdan geliyorsa daha fazla (10px) boşluk bırak.
                marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                // Mesaj kutusunun kenarlarını yuvarlaklaştır.
                borderRadius: "20px",
                // İçeriden boşluk ver.
                padding: "5px 15px",
                // Mesaj kutusunun maksimum genişliğini %75 olarak ayarla.
                maxWidth: "75%",
              }}
            >
              {m.content}
            </span>
          </div>
        ))}
    </ScrollableFeed>
  );
};

// Bileşeni dışa aktarıyoruz.
export default ScrollableChat;
