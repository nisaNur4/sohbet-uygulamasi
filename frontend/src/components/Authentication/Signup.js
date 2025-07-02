import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { VStack } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import { ChatState } from "../../Context/ChatProvider";

// `Signup` bileşeni, kullanıcıların yeni bir hesap oluşturmasını sağlar.
const Signup = () => {
  // State tanımlamaları
  const [show, setShow] = useState(false); // Parolayı göster/gizle durumu
  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [confirmpassword, setConfirmpassword] = useState();
  const [password, setPassword] = useState();
  const [pic, setPic] = useState(); // Profil resmi URL'si
  const [picLoading, setPicLoading] = useState(false); // Resim yükleme durumu

  const toast = useToast();
  const history = useHistory();
  const { setUser } = ChatState();

  // Parola alanındaki "Göster/Gizle" butonu için fonksiyon
  const handleClick = () => setShow(!show);

  // Profil resmini Cloudinary'e yükleyen fonksiyon
  const postDetails = (pics) => {
    setPicLoading(true);
    if (pics === undefined) {
      toast({
        title: "Lütfen bir resim seçin!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    // Sadece jpeg ve png formatlarını kabul et
    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "chat-app"); // Cloudinary upload preset'i
      data.append("cloud_name", "deneysel"); // Cloudinary bulut adınız
      fetch("https://api.cloudinary.com/v1_1/deneysel/image/upload", { // Cloudinary URL'niz
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setPic(data.url.toString()); // Gelen URL'yi state'e kaydet
          setPicLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setPicLoading(false);
        });
    } else {
      toast({
        title: "Lütfen JPEG veya PNG formatında bir resim seçin!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }
  };

  // Kayıt formunu gönderen fonksiyon
  const submitHandler = async () => {
    setPicLoading(true);
    // Gerekli alanların doldurulup doldurulmadığını kontrol et
    if (!name || !email || !password || !confirmpassword) {
      toast({
        title: "Lütfen tüm alanları doldurun",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }
    // Parolaların eşleşip eşleşmediğini kontrol et
    if (password !== confirmpassword) {
      toast({
        title: "Parolalar eşleşmiyor",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }
    
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };
      // Kullanıcı oluşturma API endpoint'ine istek gönder
      const { data } = await axios.post(
        "/api/user",
        { name, email, password, pic },
        config
      );
      toast({
        title: "Kayıt Başarılı!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      // Gelen kullanıcı verilerini global state'e ve local storage'a kaydet
      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      setPicLoading(false);
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
      setPicLoading(false);
    }
  };

  return (
    <VStack spacing="5px">
      <FormControl id="first-name" isRequired>
        <FormLabel>İsim</FormLabel>
        <Input
          placeholder="İsminizi girin"
          onChange={(e) => setName(e.target.value)}
        />
      </FormControl>
      <FormControl id="email-signup" isRequired>
        <FormLabel>E-posta Adresi</FormLabel>
        <Input
          type="email"
          placeholder="E-posta adresinizi girin"
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormControl>
      <FormControl id="password-signup" isRequired>
        <FormLabel>Parola</FormLabel>
        <InputGroup size="md">
          <Input
            type={show ? "text" : "password"}
            placeholder="Parola girin"
            onChange={(e) => setPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Gizle" : "Göster"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl id="confirm-password-signup" isRequired>
        <FormLabel>Parolayı Doğrula</FormLabel>
        <InputGroup size="md">
          <Input
            type={show ? "text" : "password"}
            placeholder="Parolayı tekrar girin"
            onChange={(e) => setConfirmpassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Gizle" : "Göster"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl id="pic">
        <FormLabel>Profil Resminizi Yükleyin</FormLabel>
        <Input
          type="file"
          p={1.5}
          accept="image/*"
          onChange={(e) => postDetails(e.target.files[0])}
        />
      </FormControl>
      <Button
        colorScheme="blue"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        isLoading={picLoading}
      >
        Kayıt Ol
      </Button>
    </VStack>
  );
};

export default Signup;