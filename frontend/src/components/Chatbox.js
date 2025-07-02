// Chakra UI kütüphanesinden `Box` bileşenini import ediyoruz.
// `Box`, temel bir kutu model bileşenidir ve diğer bileşenleri sarmalamak veya stil vermek için kullanılır.
import { Box } from "@chakra-ui/layout";
// Bu bileşene özel stilleri import ediyoruz.
import "./styles.css";
// `SingleChat` bileşenini import ediyoruz. Bu bileşen, seçilen sohbetin mesajlarını gösterecek.
import SingleChat from "./SingleChat";
// Uygulama genelindeki state'lere erişmek için `ChatState` hook'unu import ediyoruz.
import { ChatState } from "../Context/ChatProvider";

// `Chatbox` bileşeni, sohbet listesinden bir sohbet seçildiğinde, o sohbetin içeriğini
// (mesajlar, başlık vb.) göstermek için kullanılan ana kapsayıcıdır.
// `fetchAgain` ve `setFetchAgain` propları, sohbet listesini yeniden yüklemek için kullanılır.
const Chatbox = ({ fetchAgain, setFetchAgain }) => {
  // `ChatState` hook'u aracılığıyla global context'ten `selectedChat` (seçili sohbet) state'ini alıyoruz.
  const { selectedChat } = ChatState();

  return (
    // `Box` bileşeni, sohbet kutusunun ana kapsayıcısıdır.
    // Chakra UI'ın stil proplarını kullanarak responsive (duyarlı) bir tasarım oluşturuyoruz.
    <Box
      // `display` prop'u, ekran boyutuna göre bileşenin görünürlüğünü kontrol eder.
      // `base`: Mobil (en küçük) ekran boyutu. Eğer bir sohbet seçiliyse (`selectedChat` true ise) kutuyu göster (`flex`), değilse gizle (`none`).
      // `md`: Medium (orta) ve üzeri ekran boyutları. Her zaman göster (`flex`).
      // Bu, mobilde sohbet listesi ve sohbet kutusunun aynı anda görünmesini engeller.
      display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      // İçerideki elemanları dikeyde ortalar.
      alignItems="center"
      // İçerideki elemanların akış yönünü sütun (dikey) olarak ayarlar.
      flexDir="column"
      // İçeriden 3 birimlik boşluk (padding) verir.
      p={3}
      // Arka plan rengini beyaz yapar.
      bg="white"
      // Genişlik (width) ayarı.
      // `base`: Mobil ekranda tam genişlik (`100%`).
      // `md`: Orta ve üzeri ekranlarda genişliğin %68'i.
      w={{ base: "100%", md: "68%" }}
      // Kenarları yuvarlaklaştırır (large).
      borderRadius="lg"
      // 1 piksellik bir kenarlık (border) ekler.
      borderWidth="1px"
    >
      {/* 
        `SingleChat` bileşenini render ediyoruz. Bu bileşen, seçilen sohbetin detaylarını gösterecek.
        `fetchAgain` ve `setFetchAgain` proplarını ona da iletiyoruz, böylece
        `SingleChat` içindeki bir olay (örn: gruptan ayrılma) sohbet listesinin
        yenilenmesini tetikleyebilir.
      */}
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </Box>
  );
};

// Bileşeni dışa aktarıyoruz.
export default Chatbox;
