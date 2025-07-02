import { Avatar } from "@chakra-ui/avatar";
import { Box, Text } from "@chakra-ui/layout";

// `UserListItem`, kullanıcı arama sonuçlarında veya kullanıcı listelerinde
// tek bir kullanıcıyı temsil eden bir bileşendir.
const UserListItem = ({ user, handleFunction }) => {
  return (
    <Box
      onClick={handleFunction} // Tıklandığında üst bileşenden gelen fonksiyonu çalıştırır.
      cursor="pointer"
      bg="#E8E8E8"
      // Fare üzerine geldiğinde arka plan ve metin rengini değiştirir.
      _hover={{
        background: "#38B2AC",
        color: "white",
      }}
      w="100%"
      display="flex"
      alignItems="center"
      color="black"
      px={3}
      py={2}
      mb={2}
      borderRadius="lg"
    >
      {/* Kullanıcının profil resmini veya isminin baş harflerini gösteren avatar. */}
      <Avatar
        mr={2}
        size="sm"
        cursor="pointer"
        name={user.name}
        src={user.pic}
      />
      <Box>
        {/* Kullanıcının adı */}
        <Text>{user.name}</Text>
        {/* Kullanıcının e-posta adresi */}
        <Text fontSize="xs">
          <b>E-posta : </b>
          {user.email}
        </Text>
      </Box>
    </Box>
  );
};

export default UserListItem;