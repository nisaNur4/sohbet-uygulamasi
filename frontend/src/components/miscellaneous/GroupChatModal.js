// Gerekli Chakra UI bileşenlerini ve kancaları import ediyoruz.
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  FormControl,
  Input,
  useToast,
  Box,
} from "@chakra-ui/react";
// API istekleri için axios.
import axios from "axios";
// React'in state yönetimi için hook'u.
import { useState } from "react";
// Global state'e erişim.
import { ChatState } from "../../Context/ChatProvider";
// Özel alt bileşenler.
import UserBadgeItem from "../userAvatar/UserBadgeItem";
import UserListItem from "../userAvatar/UserListItem";

// `GroupChatModal`, yeni bir grup sohbeti oluşturmak için kullanılan bir pencere (modal) bileşenidir.
const GroupChatModal = ({ children }) => {
  // Modal'ın açık/kapalı durumunu yöneten hook.
  const { isOpen, onOpen, onClose } = useDisclosure();
  // State tanımlamaları:
  const [groupChatName, setGroupChatName] = useState(); // Oluşturulacak grubun adı.
  const [selectedUsers, setSelectedUsers] = useState([]); // Gruba eklenmek üzere seçilen kullanıcılar.
  const [search, setSearch] = useState(""); // Kullanıcı arama alanındaki metin.
  const [searchResult, setSearchResult] = useState([]); // Arama sonuçlarından dönen kullanıcı listesi.
  const [loading, setLoading] = useState(false); // Arama sırasında yükleme durumu.
  const toast = useToast();

  // Global context'ten kullanıcı bilgisi ve sohbet listesini alıyoruz.
  const { user, chats, setChats } = ChatState();

  // Arama sonuçlarından bir kullanıcıyı gruba ekleyen fonksiyon.
  const handleGroup = (userToAdd) => {
    // Eğer kullanıcı zaten eklenmişse, bir uyarı göster ve fonksiyondan çık.
    if (selectedUsers.includes(userToAdd)) {
      toast({
        title: "Kullanıcı zaten ekli",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    // Kullanıcıyı seçilenler listesine ekle.
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  // Kullanıcı arama alanına metin girildiğinde çalışan fonksiyon.
  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      return; // Arama alanı boşsa bir şey yapma.
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      // API'ye arama sorgusu ile istek at.
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

  // Seçilen bir kullanıcıyı gruptan çıkaran fonksiyon.
  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
  };

  // "Sohbet Oluştur" butonuna tıklandığında çalışan fonksiyon.
  const handleSubmit = async () => {
    // Grup adı veya seçili kullanıcı yoksa uyarı ver.
    if (!groupChatName || !selectedUsers.length) {
      toast({
        title: "Lütfen tüm alanları doldurun",
        description: "Bir grup sohbeti oluşturmak için bir isim ve en az bir kullanıcı seçmelisiniz.",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      // Grup oluşturma endpoint'ine POST isteği gönder.
      const { data } = await axios.post(
        `/api/chat/group`,
        {
          name: groupChatName,
          // Seçilen kullanıcıların ID'lerini bir JSON string'ine dönüştürerek gönder.
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config
      );
      // Yeni oluşturulan sohbeti mevcut sohbet listesinin başına ekle.
      setChats([data, ...chats]);
      onClose(); // Modal'ı kapat.
      toast({
        title: "Yeni Grup Sohbeti Oluşturuldu!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } catch (error) {
      toast({
        title: "Sohbet oluşturulamadı!",
        description: error.response.data.message || "Bir hata oluştu.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  return (
    <>
      {/* Bu bileşeni tetikleyen `children` elementini render et */}
      <span onClick={onOpen}>{children}</span>

      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="35px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
          >
            Grup Sohbeti Oluştur
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody display="flex" flexDir="column" alignItems="center">
            {/* Grup adı için giriş alanı */}
            <FormControl>
              <Input
                placeholder="Sohbet Adı"
                mb={3}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
            </FormControl>
            {/* Kullanıcı eklemek için arama alanı */}
            <FormControl>
              <Input
                placeholder="Kullanıcı ekle: örn: Ahmet, Ayşe, Ali"
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>
            {/* Seçilen kullanıcıların "badge" olarak gösterildiği kutu */}
            <Box w="100%" display="flex" flexWrap="wrap">
              {selectedUsers.map((u) => (
                <UserBadgeItem
                  key={u._id}
                  user={u}
                  handleFunction={() => handleDelete(u)}
                />
              ))}
            </Box>
            {/* Arama sonuçlarının listelendiği alan */}
            {loading ? (
              <div>Yükleniyor...</div>
            ) : (
              searchResult
                ?.slice(0, 4) // Arama sonuçlarından ilk 4'ünü göster
                .map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => handleGroup(user)}
                  />
                ))
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleSubmit} colorScheme="blue">
              Sohbet Oluştur
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatModal;