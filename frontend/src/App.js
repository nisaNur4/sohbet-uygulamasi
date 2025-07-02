// "./App.css": Bu bileşene özel temel stilleri içeren CSS dosyası.
import "./App.css";
// react-router-dom'dan gerekli bileşenleri import ediyoruz.
// Switch: Birden fazla Route bileşenini gruplamak için kullanılır ve eşleşen ilkini render eder.
// Route: Belirli bir URL yolu (path) ile bir bileşenin eşleşmesini sağlar.
import { Route, Switch } from "react-router-dom";
// Sayfa bileşenlerini import ediyoruz.
import Homepage from "./Pages/Homepage";
import Chatpage from "./Pages/Chatpage";

// 'App' bileşeni, uygulamanın ana kapsayıcısı ve yönlendirme (routing) merkezidir.
function App() {
  return (
    // Uygulamanın tamamını kapsayan ana div. "App" sınıfı App.css dosyasından gelir.
    <div className="App">
      {/* Switch bileşeni, içindeki Route'lardan URL ile eşleşen ilkini render eder. */}
      <Switch>
        {/*
          path="/": Kök URL (örn: http://localhost:3000/).
          component={Homepage}: Bu yola gidildiğinde 'Homepage' bileşenini render et.
          exact: Bu yolun tam olarak eşleşmesi gerektiğini belirtir.
        */}
        <Route path="/" component={Homepage} exact />
        {/*
          path="/chats": "/chats" URL'si (örn: http://localhost:3000/chats).
          component={Chatpage}: Bu yola gidildiğinde 'Chatpage' bileşenini render et.
        */}
        <Route path="/chats" component={Chatpage} />
      </Switch>
    </div>
  );
}

// App bileşenini, projenin başka yerlerinde (özellikle index.js'de) kullanabilmek için dışa aktarıyoruz.
export default App;
