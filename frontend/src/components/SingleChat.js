// Gerekli Chakra UI bileşenlerini ve ikonları import ediyoruz.
import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import { IconButton, Spinner, useToast } from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
// Axios, API istekleri yapmak için kullandığımız bir kütüphane.
import axios from "axios";
// React'in temel hook'larını import ediyoruz.
import { useEffect, useState } from "react";
// Sohbet mantığı için yardımcı fonksiyonlar.
import { getSender, getSenderFull } from "../config/ChatLogics";
// Global state'e erişim için hook.
import { ChatState } from "../Context/ChatProvider";
// İlgili bileşenleri import ediyoruz.
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
// Socket.io istemci kütüphanesi.
import io from "socket.io-client";
// Lottie, yüksek kaliteli animasyonları kolayca kullanmamızı sağlar.
import Lottie from "react-lottie";
// "Yazıyor..." animasyonunun verisi.
import animationData from "../animations/typing.json";
// Özel stiller.
import "./styles.css";

// Socket.io bağlantısı için değişkenler.
// `socket` bağlantıyı tutacak, `selectedChatCompare` ise gelen mesajların doğru sohbete ait olup
// olmadığını kontrol etmek için kullanılacak.
var socket, selectedChatCompare;

// `SingleChat` bileşeni, seçilen bir sohbetin tüm arayüzünü yönetir.
const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  // State tanımlamaları
  const [messages, setMessages] = useState([]); // Sohbetteki mesajları tutar.
  const [loading, setLoading] = useState(false); // Mesajlar yüklenirkenki durumu tutar.
  const [newMessage, setNewMessage] = useState(""); // Mesaj giriş alanındaki metni tutar.
  const [socketConnected, setSocketConnected] = useState(false); // Socket bağlantı durumunu tutar.
  const [typing, setTyping] = useState(false); // Kullanıcının yazıp yazmadığını tutar (gönderen taraf).
  const [isTyping, setIsTyping] = useState(false); // Başka bir kullanıcının yazıp yazmadığını tutar (alan taraf).
  
  const toast = useToast();

  // "Yazıyor..." animasyonu için Lottie ayarları.
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  // Global context'ten state'leri alıyoruz.
  const { selectedChat, setSelectedChat, user, notification, setNotification } = ChatState();

  // Seçilen sohbete ait tüm mesajları API'den çeken fonksiyon.
  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      setLoading(true);
      const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);
      setMessages(data);
      setLoading(false);

      // Mesajlar çekildikten sonra, kullanıcıyı bu sohbetin odasına (room) dahil et.
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Bir Hata Oluştu!",
        description: "Mesajlar yüklenemedi.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  // `useEffect` hook'u ile socket.io bağlantısını kuruyoruz.
  // Bu effect, bileşen ilk render edildiğinde sadece bir kez çalışır.
  useEffect(() => {
    // Sunucuya socket bağlantısı kur.
    socket = io(); // package.json'daki proxy sayesinde tam URL'ye gerek yok.
    // 'setup' olayı ile kullanıcı bilgilerini sunucuya gönder.
    socket.emit("setup", user);
    // Sunucudan 'connected' olayı geldiğinde `socketConnected` state'ini true yap.
    socket.on("connected", () => setSocketConnected(true));
    // 'typing' ve 'stop typing' olaylarını dinle.
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    return () => {
        socket.disconnect();
    };
  }, [user]); // 'user' bağımlılığını ekledik.

  // Bu `useEffect`, `selectedChat` değiştiğinde çalışır.
  useEffect(() => {
    fetchMessages();
    // Gelen yeni mesajların bu sohbete ait olup olmadığını kontrol etmek için
    // `selectedChat`'in bir kopyasını `selectedChatCompare`'de tutuyoruz.
    selectedChatCompare = selectedChat;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat]);

  // Bu `useEffect`, gelen socket olaylarını dinler.
  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      // Eğer şu an açık bir sohbet yoksa veya gelen mesaj farklı bir sohbete aitse,
      // bu mesajı bir bildirim olarak ekle.
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          // Sohbet listesindeki son mesajı güncellemek için `MyChats` bileşenini tetikle.
          setFetchAgain(!fetchAgain);
        }
      } else {
        // Gelen mesaj şu an açık olan sohbete aitse, mesajları state'ine ekle.
        setMessages((prevMessages) => [...prevMessages, newMessageRecieved]);
      }
    });
    
    // Her render'da listener'ın tekrar eklenmemesi için cleanup fonksiyonu ekliyoruz.
    return () => {
      socket.off("message recieved");
    };
  });


  // Enter tuşuna basıldığında mesaj gönderen fonksiyon.
  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      // Mesaj gönderildiğinde 'yazıyor' durumunu durdur.
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        // Giriş alanını temizle.
        setNewMessage("");
        const { data } = await axios.post("/api/message", {
          content: newMessage,
          chatId: selectedChat._id,
        }, config);
        
        // Sunucuya 'new message' olayı ile yeni mesajı gönder.
        socket.emit("new message", data);
        // Mesajı anında arayüzde göstermek için `messages` state'ine ekle.
        setMessages((prevMessages) => [...prevMessages, data]);
      } catch (error) {
        toast({
          title: "Bir Hata Oluştu!",
          description: "Mesaj gönderilemedi.",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  // Kullanıcı mesaj yazarken çalışan fonksiyon.
  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    // Eğer kullanıcı zaten 'yazıyor' durumunda değilse, durumu başlat.
    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    
    // Kullanıcı yazmayı bıraktıktan 3 saniye sonra 'yazıyor' durumunu bitir.
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            {/* Mobilde geri dönme butonu */}
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {/* Sohbet başlığı */}
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchMessages={fetchMessages}
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                />
              </>
            )}
          </Text>
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner size="xl" w={20} h={20} alignSelf="center" margin="auto" />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}
            <FormControl
              onKeyDown={sendMessage}
              id="first-name"
              isRequired
              mt={3}
            >
              {isTyping ? (
                <div>
                  <Lottie
                    options={defaultOptions}
                    width={70}
                    style={{ marginBottom: 15, marginLeft: 0 }}
                  />
                </div>
              ) : (
                <></>
              )}
              <Input
                variant="filled"
                bg="#E0E0E0"
                placeholder="Mesajınızı girin.."
                value={newMessage}
                onChange={typingHandler}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        // Eğer bir sohbet seçilmemişse, bir karşılama metni göster.
        <Box display="flex" alignItems="center" justifyContent="center" h="100%">
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Sohbete başlamak için bir kullanıcıya tıklayın.
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;