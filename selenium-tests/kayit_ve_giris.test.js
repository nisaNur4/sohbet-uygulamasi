// Gerekli Selenium modüllerini import ediyoruz.
// Builder: Tarayıcıyı (driver) oluşturmak için kullanılır.
// By: HTML elementlerini bulma stratejilerini (ID, name, CSS selector vb.) içerir.
// Key: Klavye tuşlarını (Enter, Tab vb.) simüle etmek için kullanılır.
// until: Belirli bir koşulun gerçekleşmesini (örneğin bir elementin görünür olmasını) beklemek için kullanılır.
const { Builder, By, Key, until } = require('selenium-webdriver');

// Test senaryomuzu bir 'describe' bloğu içinde grupluyoruz (sadece okunabilirlik için).
async function kayitVeGirisTesti() {
  let driver = await new Builder().forBrowser('chrome').build();
  let testBasarili = false;
  // Her testte benzersiz bir e-posta üretelim
  const uniqueEmail = `seleniumtest_${Date.now()}@ornek.com`;
  const password = 'Selenium123!';
  const name = 'Selenium Kullanıcısı';

  try {
    console.log("Test Senaryosu: Kayıt Ol ve Giriş Yap Akışı");
    await driver.get('http://localhost:3000/');

    // 1. Adım: 'Kayıt Ol' sekmesine tıkla
    const signupTabXPath = "//button[@role='tab' and text()='Kayıt Ol']";
    await driver.wait(until.elementLocated(By.xpath(signupTabXPath)), 10000);
    const signupTab = await driver.findElement(By.xpath(signupTabXPath));
    await signupTab.click();
    console.log("  Adım 1: 'Kayıt Ol' sekmesine tıklandı.");

    // 2. Adım: Form alanlarını doldur (Doğru ID'ler ile güncellendi)
    await driver.wait(until.elementLocated(By.id('first-name')), 10000);
    await driver.findElement(By.id('first-name')).sendKeys(name);
    await driver.findElement(By.id('email-signup')).sendKeys(uniqueEmail);
    await driver.findElement(By.id('password-signup')).sendKeys(password);
    await driver.findElement(By.id('confirm-password-signup')).sendKeys(password); // Eksik olan parola doğrulama eklendi
    console.log(`  Adım 2: Form dolduruldu (isim: ${name}, email: ${uniqueEmail})`);

    // 3. Adım: 'Kayıt Ol' butonuna tıkla
    const signupButtonXPath = "//button[text()='Kayıt Ol' and not(@role='tab')]";
    await driver.wait(until.elementLocated(By.xpath(signupButtonXPath)), 10000);
    const signupButton = await driver.findElement(By.xpath(signupButtonXPath));
    await signupButton.click();
    console.log("  Adım 3: 'Kayıt Ol' butonuna tıklandı.");

    // 4. Adım: Sohbet sayfasına yönlendirildiğini doğrula
    await driver.wait(until.urlContains('/chats'), 10000);
    const currentUrl = await driver.getCurrentUrl();
    console.log(`  Adım 4: Sohbet sayfasına yönlendirildi. Mevcut URL: ${currentUrl}`);

    // 5. Adım: Ekranda 'Sohbetlerim' başlığını gör
    await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Sohbetlerim')]")), 10000);
    console.log("  Adım 5: 'Sohbetlerim' başlığı bulundu. Test başarılı.");
    testBasarili = true;
  } catch (hata) {
    console.error("Test sırasında bir hata oluştu:", hata);
  } finally {
    if (driver) await driver.quit();
    if (testBasarili) {
      console.log("\n--- SONUÇ: Kayıt ve Giriş Testi BAŞARIYLA TAMAMLANDI ---");
    } else {
      console.log("\n--- SONUÇ: Kayıt ve Giriş Testi BAŞARISIZ OLDU ---");
    }
  }
}

// Test fonksiyonumuzu çağırarak testi başlatıyoruz.
kayitVeGirisTesti(); 