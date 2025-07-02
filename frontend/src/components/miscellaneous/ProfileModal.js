// Gerekli Chakra UI bileşenlerini ve ikonu import ediyoruz.
import { ViewIcon } from "@chakra-ui/icons";
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
  IconButton,
  Text,
  Image,
} from "@chakra-ui/react";

// `ProfileModal`, bir kullanıcının profil bilgilerini (isim, email, resim)
// bir pencere (modal) içinde gösteren bir bileşendir.
const ProfileModal = ({ user, children }) => {
  // `useDisclosure` hook'u, modal gibi açılıp kapanabilen bileşenlerin durumunu
  // (açık/kapalı) kolayca yönetmek için kullanılır.
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      {/* 
        Bu modal'ı tetikleyecek olan elementi burada render ediyoruz.
        Eğer `children` prop'u varsa (örn: bir metin veya başka bir bileşen), onu gösterir.
        Eğer `children` yoksa, varsayılan olarak bir "göz" ikonu butonu gösterir.
        Her iki durumda da, tıklandığında `onOpen` fonksiyonu çağrılarak modal açılır.
      */}
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <IconButton display={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />
      )}
      {/* Chakra UI Modal bileşeni */}
      <Modal size="lg" onClose={onClose} isOpen={isOpen} isCentered>
        {/* Modal açıldığında arkaplanı karartan katman */}
        <ModalOverlay />
        {/* Modal'ın içeriğini kapsayan ana kutu */}
        <ModalContent h="410px">
          {/* Modal başlığı: Kullanıcının adını gösterir. */}
          <ModalHeader
            fontSize="40px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
          >
            {user.name}
          </ModalHeader>
          {/* Modal'ı kapatma butonu */}
          <ModalCloseButton />
          {/* Modal'ın gövdesi */}
          <ModalBody
            display="flex"
            flexDir="column"
            alignItems="center"
            justifyContent="space-between"
          >
            {/* Kullanıcının profil resmini gösterir. */}
            <Image
              borderRadius="full"
              boxSize="150px"
              src={user.pic}
              alt={user.name}
            />
            {/* Kullanıcının email adresini gösterir. */}
            <Text
              fontSize={{ base: "28px", md: "30px" }}
              fontFamily="Work sans"
            >
              E-posta: {user.email}
            </Text>
          </ModalBody>
          {/* Modal'ın alt kısmı (footer) */}
          <ModalFooter>
            {/* Modal'ı kapatmak için kullanılan buton. */}
            <Button onClick={onClose}>Kapat</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProfileModal;