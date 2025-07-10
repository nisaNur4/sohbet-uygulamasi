Talk-A-Tive, gerçek zamanlı sohbet için Socket.io kullanan ve kullanıcı bilgilerini MongoDB veri tabanında şifreli olarak saklayan bir sohbet uygulamasıdır.

İstemci: React JS
Sunucu: Node JS, Express JS
Veri tabanı: MongoDB

Bağımlılıkların Yüklenmesi

  npm install

  cd frontend/
  npm install

Uygulamayı Başlatma
Sunucuyu Başlatma

  npm run start

İstemciyi Başlatma

  cd frontend
  npm start

Test Komutları

Bu proje; backend, kullanıcı arayüzü (UI) ve API performansını kapsayan kapsamlı bir test paketine sahiptir.

Backend Birim Testleri ve Kapsamı

Backend fonksiyonlarının birim testlerini ve kapsama raporunu çalıştırır. 

  npm test

Alternatif olarak, yalnızca backend birim testlerini çalıştırmak için:

  npm run test --prefix backend

Otomatik Birim Testi ve Sunucu

Hem backend sunucusunu hem de birim testlerini aynı anda başlatır.

  npm run dev

Selenium UI Testi

Tüm kullanıcı arayüzü akışlarını otomasyonla test eder. Kayıt, giriş ve sohbet gibi kullanıcı eylemlerini simüle eder. Bu komutu çalıştırmadan önce uygulama çalışmalı. 

  node selenium-tests/selenium-ui-full-flow.test.js

Postman API Testleri

Postman uygulamasında postman-tests/mern-chat-api-tests.postman_collection.json dosyasını içe aktararak ve koleksiyonu çalıştırarak tüm API uç noktaları otomatik olarak test edilebilir.

Komut satırından Newman ile çalıştırmak için öncelikle Newman yüklenir:

  npm install newman

Daha önce global olarak Newman kuruluysa kaldırmak için:

  npm uninstall -g newman

Ardından koleksiyonu şu şekilde çalıştırılır:

  ./node_modules/.bin/newman run postman-tests/mern-chat-api-tests.postman_collection.json -r cli,json

Alternatif olarak, API testlerini çalıştırmak için:

  npx newman run postman-tests/mern-chat-api-tests.postman_collection.json

Bu komutlar, tüm API uç noktalarını başarı ve hata durumları için test eder ve sonuçları terminalde gösterir.

DoS Saldırısı Simülasyonu (Artillery)

Sunucuya yüksek trafik yükü simüle ederek Hizmet Reddi (DoS) saldırılarına karşı direncini test eder. Backend sunucusu çalışmalı.

  npx artillery run dos-tests/dos-test.yml
