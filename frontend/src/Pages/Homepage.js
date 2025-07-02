import {
  Box,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useHistory } from "react-router-dom";
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";

// `Homepage`, uygulamanın başlangıç sayfasıdır.
// Giriş (Login) ve Kayıt Ol (Signup) sekmelerini içerir.
function Homepage() {
  const history = useHistory();

  // Bu `useEffect`, bileşen yüklendiğinde çalışır ve kullanıcının
  // zaten giriş yapıp yapmadığını kontrol eder.
  useEffect(() => {
    // `localStorage`'dan kullanıcı bilgilerini al.
    const user = JSON.parse(localStorage.getItem("userInfo"));

    // Eğer kullanıcı bilgisi varsa (yani kullanıcı zaten giriş yapmışsa),
    // onu doğrudan sohbet sayfasına yönlendir.
    if (user) {
      history.push("/chats");
    }
  }, [history]); // Bağımlılık dizisi, `history` nesnesi değiştiğinde (genellikle değişmez) effect'in tekrar çalışmasını sağlar.

  return (
    <Container maxW="xl" centerContent>
      {/* Uygulama başlığının olduğu kutu */}
      <Box
        display="flex"
        justifyContent="center"
        p={3}
        bg="white"
        w="100%"
        m="40px 0 15px 0"
        borderRadius="lg"
        borderWidth="1px"
      >
        <Text fontSize="4xl" fontFamily="Work sans">
          Sohbet
        </Text>
      </Box>
      {/* Giriş ve Kayıt sekmelerini içeren kutu */}
      <Box bg="white" w="100%" p={4} borderRadius="lg" borderWidth="1px">
        <Tabs isFitted variant="soft-rounded">
          <TabList mb="1em">
            <Tab>Giriş Yap</Tab>
            <Tab>Kayıt Ol</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              {/* Giriş yapma bileşeni */}
              <Login />
            </TabPanel>
            <TabPanel>
              {/* Kayıt olma bileşeni */}
              <Signup />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
}

export default Homepage;