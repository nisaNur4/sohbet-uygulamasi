// React: Kullanıcı arayüzleri oluşturmak için temel kütüphane.
import React from "react";
// ReactDOM: React bileşenlerini DOM'a (Document Object Model) render etmek için kullanılır.
import ReactDOM from "react-dom";
// "./index.css": Uygulama geneli için temel CSS stillerini içeren dosya.
import "./index.css";
// App: Uygulamanın ana bileşeni.
import App from "./App";
// reportWebVitals: Web Vitals metriklerini (performans ölçümleri) raporlamak için kullanılır.
import reportWebVitals from "./reportWebVitals";
// ChakraProvider: Chakra UI kütüphanesinin bileşenlerinin çalışabilmesi için uygulamayı sarmalayan ana sağlayıcı (provider).
import { ChakraProvider } from "@chakra-ui/react";
// ChatProvider: Kendi oluşturduğumuz ve uygulama genelinde sohbetle ilgili state'leri yöneten Context Provider.
import ChatProvider from "./Context/ChatProvider";
// BrowserRouter: React Router kütüphanesinden gelen ve URL tabanlı yönlendirmeyi (routing) sağlayan bileşen.
import { BrowserRouter } from "react-router-dom";

// Uygulamanın render edileceği, public/index.html dosyasındaki 'root' id'li DOM elemanını seçiyoruz.
ReactDOM.render(
  <React.StrictMode>
    <ChakraProvider>
      <BrowserRouter>
        <ChatProvider>
          <App />
        </ChatProvider>
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// Web Vitals raporlamasını başlatıyoruz.
// Bu fonksiyon, sayfa performansı hakkında bilgi toplar. (örn. console.log ile)
reportWebVitals();
