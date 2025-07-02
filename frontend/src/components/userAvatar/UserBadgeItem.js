import { CloseIcon } from "@chakra-ui/icons";
import { Badge } from "@chakra-ui/layout";

// `UserBadgeItem`, bir grup sohbetine eklenmiş olan kullanıcıları
// "etiket" (badge) şeklinde gösteren küçük bir bileşendir.
const UserBadgeItem = ({ user, handleFunction, admin }) => {
  return (
    <Badge
      px={2}
      py={1}
      borderRadius="lg"
      m={1}
      mb={2}
      variant="solid"
      fontSize={12}
      colorScheme="purple"
      cursor="pointer"
      onClick={handleFunction} // Tıklandığında (genellikle kullanıcıyı gruptan çıkarmak için) ilgili fonksiyonu çalıştırır.
    >
      {/* Kullanıcının adını gösterir. */}
      {user.name}
      {/* Eğer bu kullanıcı grubun yöneticisiyse, "(Admin)" yazısını ekler. */}
      {admin && admin._id === user._id && <span> (Admin)</span>}
      {/* Kullanıcıyı listeden çıkarmak için çarpı ikonu. */}
      <CloseIcon pl={1} />
    </Badge>
  );
};

export default UserBadgeItem;