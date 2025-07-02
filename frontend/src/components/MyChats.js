// Gerekli ikonları, bileşenleri ve kancaları import ediyoruz.
import { AddIcon } from "@chakra-ui/icons";
import { Box, Stack, Text } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useEffect, useState } from "react";
import { Button } from "@chakra-ui/react";
// `ChatLogics`'ten sohbet mantığı ile ilgili yardımcı fonksiyonları import ediyoruz.
import { getSender } from "../config/ChatLogics";
// Yükleme durumu için iskelet bileşenini import ediyoruz.
import ChatLoading from "./ChatLoading";
// Grup sohbeti oluşturma/düzenleme penceresi (modal) bileşenini import ediyoruz.
import GroupChatModal from "./miscellaneous/GroupChatModal";
// Global state'e erişim için `ChatState` hook'unu import ediyoruz.
import { ChatState } from "../Context/ChatProvider";

// `MyChats` bileşeni, kullanıcının dahil olduğu tüm sohbetleri listeleyen kutuyu temsil eder.
const MyChats = ({ fetchAgain }) => {
  // Bu state, `localStorage`'dan alınan ve o an giriş yapmış olan kullanıcı bilgilerini tutar.
  const [loggedUser, setLoggedUser] = useState();

  // Global context'ten gerekli state'leri ve state'i güncelleyen fonksiyonları alıyoruz.
  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();

  // `useToast`, kullanıcıya bildirim (toast) göstermek için kullanılan bir Chakra UI hook'udur.
  const toast = useToast();

  // `fetchChats` fonksiyonu, API'ye istek atarak kullanıcının sohbetlerini çeker.
  const fetchChats = async () => {
    try {
      // API isteği için gerekli olan header'ları, özellikle yetkilendirme (Authorization) token'ını hazırlıyoruz.
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      // `/api/chat` endpoint'ine GET isteği atıyoruz.
      const { data } = await axios.get("/api/chat", config);
      // Gelen sohbet listesini `chats` state'ine kaydediyoruz.
      setChats(data);
    } catch (error) {
      // Hata durumunda kullanıcıya bir bildirim gösteriyoruz.
      toast({
        title: "Bir Hata Oluştu!",
        description: "Sohbetler yüklenirken bir sorun oluştu.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  // `useEffect`, bileşen yüklendiğinde ve `fetchAgain` prop'u değiştiğinde çalışır.
  useEffect(() => {
    // `localStorage`'dan kullanıcı bilgilerini alıp `loggedUser` state'ine kaydediyoruz.
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    // Sohbetleri çekme fonksiyonunu çağırıyoruz.
    fetchChats();
    // eslint-disable-next-line
  }, [fetchAgain]); // `fetchAgain` değiştiğinde (örn: yeni grup oluşturulduğunda) sohbetler yeniden çekilir.

  return (
    // "Sohbetlerim" kutusunun ana kapsayıcısı.
    <Box
      // Ekran boyutuna göre görünürlük ayarı. Mobilde bir sohbet seçiliyse bu kutu gizlenir.
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      {/* Başlık ve "Yeni Grup Sohbeti" butonu */}
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        Sohbetlerim
        <GroupChatModal>
          <Button
            display="flex"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
          >
            Yeni Grup Sohbeti
          </Button>
        </GroupChatModal>
      </Box>
      {/* Sohbet listesinin olduğu kutu */}
      <Box
        display="flex"
        flexDir="column"
        p={3}
        bg="#F8F8F8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {chats ? (
          // Eğer sohbetler yüklenmişse, listeyi göster.
          <Stack overflowY="scroll">
            {chats.map((chat) => (
              // Her bir sohbet için tıklanabilir bir kutu oluştur.
              <Box
                onClick={() => setSelectedChat(chat)} // Tıklandığında bu sohbeti "seçili sohbet" yap.
                cursor="pointer"
                // Seçili sohbetin arka planını farklı bir renkte göster.
                bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                color={selectedChat === chat ? "white" : "black"}
                px={3}
                py={2}
                borderRadius="lg"
                key={chat._id}
              >
                <Text>
                  {/* Sohbetin adını göster. Grup sohbeti değilse, diğer kullanıcının adını göster. */}
                  {!chat.isGroupChat
                    ? getSender(loggedUser, chat.users)
                    : chat.chatName}
                </Text>
                {/* Eğer son bir mesaj varsa, onu da göster. */}
                {chat.latestMessage && (
                  <Text fontSize="xs">
                    <b>{chat.latestMessage.sender.name} : </b>
                    {/* Mesaj 50 karakterden uzunsa kısaltarak göster. */}
                    {chat.latestMessage.content.length > 50
                      ? chat.latestMessage.content.substring(0, 51) + "..."
                      : chat.latestMessage.content}
                  </Text>
                )}
              </Box>
            ))}
          </Stack>
        ) : (
          // Sohbetler henüz yüklenmediyse, yükleme animasyonunu göster.
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
