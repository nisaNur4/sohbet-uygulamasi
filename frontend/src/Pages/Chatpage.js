import { Box } from "@chakra-ui/layout";
import { useState } from "react";
import Chatbox from "../components/Chatbox";
import MyChats from "../components/MyChats";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import { ChatState } from "../Context/ChatProvider";

// `Chatpage`, uygulamanın ana sohbet arayüzünü oluşturan sayfadır.
// Kullanıcı giriş yaptıktan sonra bu sayfaya yönlendirilir.
const Chatpage = () => {
  // `fetchAgain` state'i, sohbet listesinin yeniden yüklenmesi gerekip gerekmediğini kontrol eder.
  // Bu state'in değeri değiştiğinde, `MyChats` bileşeni sohbetleri yeniden çeker.
  // Örneğin, bir grup sohbeti güncellendiğinde veya yeni bir sohbet oluşturulduğunda bu state tetiklenir.
  const [fetchAgain, setFetchAgain] = useState(false);
  // Global context'ten `user` bilgisini alıyoruz.
  const { user } = ChatState();

  return (
    <div style={{ width: "100%" }}>
      {/* Kullanıcı bilgisi varsa, üst navigasyon çubuğunu (`SideDrawer`) göster. */}
      {user && <SideDrawer />}
      {/* 
        Ana layout kutusu. `MyChats` (sol panel) ve `Chatbox` (sağ panel) bileşenlerini içerir.
        `display="flex"` ile bu iki bileşeni yan yana dizer.
      */}
      <Box
        display="flex"
        justifyContent="space-between"
        w="100%"
        h="91.5vh" // Ekran yüksekliğinin %91.5'ini kaplar (SideDrawer'ın yüksekliği hariç).
        p="10px"
      >
        {/* Kullanıcı bilgisi varsa, 'Sohbetlerim' panelini göster. */}
        {user && <MyChats fetchAgain={fetchAgain} />}
        {/* 
          Kullanıcı bilgisi varsa, 'Sohbet Kutusu' panelini göster.
          `fetchAgain` ve `setFetchAgain` propları, `Chatbox` içindeki bir eylemin
          `MyChats`'i güncellemesini sağlamak için zincirleme (prop drilling) ile iletilir.
        */}
        {user && (
          <Chatbox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        )}
      </Box>
    </div>
  );
};

export default Chatpage;