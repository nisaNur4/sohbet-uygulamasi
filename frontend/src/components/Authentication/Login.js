import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { VStack } from "@chakra-ui/layout";
import { useState } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import { ChatState } from "../../Context/ChatProvider";

// Login bileşeni, mevcut kullanıcıların giriş yapmasını sağlar.
const Login = () => {
  // State tanımlamaları
  const [show, setShow] = useState(false); // Parolayı göster/gizle durumu
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Giriş yapma sırasındaki yükleme durumu

  const toast = useToast();
  const history = useHistory();
  // Global context'ten setUser fonksiyonunu alıyoruz.
  const { setUser } = ChatState();

  // Parola alanındaki "Göster/Gizle" butonu için fonksiyon
  const handleClick = () => setShow(!show);

  // Giriş formunu gönderen fonksiyon
  const submitHandler = async () => {
    setLoading(true);
    // Email veya parola alanının boş olup olmadığını kontrol et
    if (!email || !password) {
      toast({
        title: "Lütfen tüm alanları doldurun",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      // Giriş yapma API endpoint'ine istek gönder
      const { data } = await axios.post(
        "/api/user/login",
        { email, password },
        config
      );

      toast({
        title: "Giriş Başarılı!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      
      // Gelen kullanıcı verilerini global state'e ve local storage'a kaydet
      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      // Kullanıcıyı sohbet sayfasına yönlendir
      history.push("/chats");
    } catch (error) {
      toast({
        title: "Bir hata oluştu!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  return (
    <VStack spacing="5px">
      <FormControl id="email-login" isRequired>
        <FormLabel>E-posta Adresi</FormLabel>
        <Input
          value={email}
          type="email"
          placeholder="E-posta adresinizi girin"
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormControl>
      <FormControl id="password-login" isRequired>
        <FormLabel>Parola</FormLabel>
        <InputGroup size="md">
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={show ? "text" : "password"}
            placeholder="Parolanızı girin"
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Gizle" : "Göster"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <Button
        colorScheme="blue"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        isLoading={loading}
      >
        Giriş Yap
      </Button>
      {/* Misafir kullanıcı olarak hızlı giriş yapmak için bir buton */}
      <Button
        variant="solid"
        colorScheme="red"
        width="100%"
        onClick={() => {
          setEmail("guest@example.com");
          setPassword("123456");
        }}
      >
        Misafir Kullanıcı Bilgilerini Al
      </Button>
    </VStack>
  );
};

export default Login;