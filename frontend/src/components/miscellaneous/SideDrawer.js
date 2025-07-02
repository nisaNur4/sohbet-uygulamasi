// Gerekli tüm Chakra UI bileşenlerini, kancaları ve ikonları import ediyoruz.
import { Button } from "@chakra-ui/button";
import { useDisclosure } from "@chakra-ui/hooks";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/modal";
import { Tooltip } from "@chakra-ui/tooltip";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Avatar } from "@chakra-ui/avatar";
import { Spinner } from "@chakra-ui/spinner";

// React, Axios ve diğer kütüphaneleri import ediyoruz.
import { useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import { useToast } from "@chakra-ui/toast";
import NotificationBadge, { Effect } from "react-notification-badge";

// Yerel bileşenleri ve context'i import ediyoruz.
import ChatLoading from "../ChatLoading";
import ProfileModal from "./ProfileModal";
import UserListItem from "../userAvatar/UserListItem";
import { ChatState } from "../../Context/ChatProvider";
import { getSender } from "../../config/ChatLogics";

// `SideDrawer` bileşeni, uygulamanın üst kısmındaki başlık çubuğunu ve
// soldan açılan kullanıcı arama menüsünü (drawer) yönetir.
function SideDrawer() {
  // State tanımlamaları
  const [search, setSearch] = useState(""); // Arama çubuğundaki metin.
  const [searchResult, setSearchResult] = useState([]); // Arama sonuçları.
  const [loading, setLoading] = useState(false); // Arama yükleme durumu.
  const [loadingChat, setLoadingChat] = useState(false); // Sohbet oluşturma yükleme durumu.

  // Global context'ten state ve fonksiyonları alıyoruz.
  const {
    setSelectedChat,
    user,
    notification,
    setNotification,
    chats,
    setChats,
  } = ChatState();

  const toast = useToast();
  // `useDisclosure`, Drawer'ın (yan menü) açık/kapalı durumunu yönetir.
  const { isOpen, onOpen, onClose } = useDisclosure();
  // `useHistory` hook'u, programatik olarak sayfa yönlendirmesi yapmak için kullanılır.
  const history = useHistory();

  // Çıkış yapma fonksiyonu.
  const logoutHandler = () => {
    localStorage.removeItem("userInfo"); // Kullanıcı bilgilerini local storage'dan sil.
    history.push("/"); // Kullanıcıyı anasayfaya yönlendir.
  };

  // Arama butonuna tıklandığında veya Enter'a basıldığında çalışan fonksiyon.
  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Lütfen arama alanına bir şeyler yazın",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      // Kullanıcı arama API endpoint'ine istek gönder.
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Bir Hata Oluştu!",
        description: "Arama sonuçları yüklenemedi.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      setLoading(false);
    }
  };

  // Arama sonuçlarından bir kullanıcıya tıklandığında çalışan fonksiyon.
  // Bu fonksiyon, o kullanıcıyla bir sohbet başlatır veya mevcut sohbeti açar.
  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      // Sohbet oluşturma veya getirme API endpoint'ine istek gönder.
      const { data } = await axios.post(`/api/chat`, { userId }, config);

      // Eğer bu sohbet zaten `chats` listesinde yoksa, listeye ekle.
      if (!chats.find((c) => c._id === data._id)) {
        setChats([data, ...chats]);
      }
      setSelectedChat(data);
      setLoadingChat(false);
      onClose(); // Yan menüyü (Drawer) kapat.
    } catch (error) {
      toast({
        title: "Sohbet getirilirken hata oluştu",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="white"
        w="100%"
        p="5px 10px 5px 10px"
        borderWidth="5px"
      >
        <Tooltip label="Sohbet etmek için kullanıcı arayın" hasArrow placement="bottom-end">
          <Button variant="ghost" onClick={onOpen}>
            <i className="fas fa-search"></i>
            <Text display={{ base: "none", md: "flex" }} px={4}>
              Kullanıcı Ara
            </Text>
          </Button>
        </Tooltip>
        <Text fontSize="2xl" fontFamily="Work sans">
          Sohbet
        </Text>
        <div>
          <Menu>
            <MenuButton p={1}>
              <NotificationBadge
                count={notification.length}
                effect={Effect.SCALE}
              />
              <BellIcon fontSize="2xl" m={1} />
            </MenuButton>
            <MenuList pl={2}>
              {!notification.length && "Yeni mesaj yok"}
              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((n) => n !== notif));
                  }}
                >
                  {notif.chat.isGroupChat
                    ? `'${notif.chat.chatName}' grubunda yeni mesaj`
                    : `${getSender(user, notif.chat.users)}'dan yeni mesaj`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} bg="white" rightIcon={<ChevronDownIcon />}>
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.pic}
              />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>Profilim</MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Çıkış Yap</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Kullanıcı Ara</DrawerHeader>
          <DrawerBody>
            <Box display="flex" pb={2}>
              <Input
                placeholder="İsim veya e-posta ile arayın"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch}>Ara</Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" display="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default SideDrawer;