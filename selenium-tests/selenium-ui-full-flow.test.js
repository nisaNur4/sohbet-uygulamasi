const { Builder, By, Key, until } = require('selenium-webdriver');

async function runFullUITest() {
  let driver = await new Builder().forBrowser('chrome').build();
  const timestamp = Date.now();
  const user1 = {
    name: 'Test User 1',
    email: `testuser1_${timestamp}@example.com`,
    password: '123456'
  };
  const user2 = {
    name: 'Test User 2',
    email: `testuser2_${timestamp}@example.com`,
    password: '123456'
  };
  try {
    console.log('--- Selenium UI Full Flow Test Başladı ---');
    // Başlangıçta sayfanın tam yüklenmesini bekle
    await driver.get('http://localhost:3000/');
    await driver.sleep(1500);
    // 1. Yanlış bilgiyle kayıt ol (fail)
    await driver.wait(until.elementLocated(By.xpath("//button[@role='tab' and text()='Kayıt Ol']")), 10000);
    await driver.findElement(By.xpath("//button[@role='tab' and text()='Kayıt Ol']")).click();
    await driver.sleep(500);
    await driver.findElement(By.id('first-name')).sendKeys('');
    await driver.findElement(By.id('email-signup')).sendKeys('');
    await driver.findElement(By.id('password-signup')).sendKeys('');
    await driver.findElement(By.id('confirm-password-signup')).sendKeys('');
    await driver.findElement(By.xpath("//button[text()='Kayıt Ol' and not(@role='tab')]")).click();
    await driver.sleep(1200); // Uyarı mesajı için bekle
    // Uyarı kaybolana kadar bekle (varsa)
    try {
      await driver.wait(until.stalenessOf(driver.findElement(By.css('.chakra-alert'))), 3000);
    } catch (e) {}

    // 2. Başarılı kayıt ol
    await driver.findElement(By.id('first-name')).clear();
    await driver.findElement(By.id('first-name')).sendKeys(user1.name);
    await driver.findElement(By.id('email-signup')).clear();
    await driver.findElement(By.id('email-signup')).sendKeys(user1.email);
    await driver.findElement(By.id('password-signup')).clear();
    await driver.findElement(By.id('password-signup')).sendKeys(user1.password);
    await driver.findElement(By.id('confirm-password-signup')).clear();
    await driver.findElement(By.id('confirm-password-signup')).sendKeys(user1.password);
    await driver.sleep(500);
    await driver.findElement(By.xpath("//button[text()='Kayıt Ol' and not(@role='tab')]")).click();
    await driver.wait(until.urlContains('/chats'), 10000);
    await driver.sleep(1000);

    // 3. Çıkış yap
    // Profil menüsü butonunu (avatar içeren) bul ve tıkla
    const menuButtons1 = await driver.findElements(By.css('button.chakra-menu__menu-button'));
    let clickedProfileMenu1 = false;
    for (let btn of menuButtons1) {
      const avatar = await btn.findElements(By.css('.chakra-avatar'));
      if (avatar.length > 0) {
        await btn.click();
        clickedProfileMenu1 = true;
        break;
      }
    }
    if (!clickedProfileMenu1) throw new Error('Profil menüsü butonu bulunamadı!');
    await driver.sleep(2000);
    let menuItems1 = await driver.findElements(By.css('.chakra-menu__menuitem'));
    let foundLogout1 = false;
    for (let item of menuItems1) {
      let text = await item.getText();
      console.log('MENUITEM:', text);
      if (text && text.includes('Çıkış Yap')) {
        await driver.sleep(2000);
        try {
          await driver.wait(until.elementIsVisible(item), 2000);
          await driver.wait(until.elementIsEnabled(item), 2000);
          await item.click();
        } catch (e) {
          await driver.executeScript('arguments[0].click();', item);
        }
        await driver.sleep(1200);
        await driver.wait(until.urlIs('http://localhost:3000/'), 10000);
        foundLogout1 = true;
        break;
      }
    }
    if (!foundLogout1) {
      throw new Error("Çıkış Yap butonu menüde bulunamadı veya tıklanamadı!");
    }
    await driver.sleep(800);

    // 4. Yanlış şifreyle giriş yap (fail)
    await driver.findElement(By.xpath("//button[@role='tab' and text()='Giriş Yap']")).click();
    await driver.sleep(400);
    await driver.findElement(By.id('email-signup')).clear();
    await driver.findElement(By.id('email-signup')).sendKeys(user1.email);
    await driver.findElement(By.id('password-signup')).clear();
    await driver.findElement(By.id('password-signup')).sendKeys('yanlisSifre');
    await driver.findElement(By.xpath("//button[text()='Giriş Yap' and not(@role='tab')]")).click();
    await driver.sleep(1200);
    try {
      await driver.wait(until.stalenessOf(driver.findElement(By.css('.chakra-alert'))), 3000);
    } catch (e) {}

    // 5. Başarılı giriş yap
    await driver.findElement(By.id('password-signup')).clear();
    await driver.findElement(By.id('password-signup')).sendKeys(user1.password);
    await driver.sleep(400);
    await driver.findElement(By.xpath("//button[text()='Giriş Yap' and not(@role='tab')]")).click();
    await driver.wait(until.urlContains('/chats'), 10000);
    await driver.sleep(1000);

    // 6. Profil modalını aç/kapat
    await driver.findElement(By.css('button[aria-haspopup="menu"]')).click();
    await driver.sleep(300);
    await driver.findElement(By.xpath("//span[text()='Profilim']")).click();
    await driver.wait(until.elementLocated(By.xpath("//button[text()='Kapat']")), 5000);
    await driver.sleep(400);
    await driver.findElement(By.xpath("//button[text()='Kapat']")).click();
    await driver.sleep(400);

    // 7. Kullanıcı arama drawer'ını aç, kullanıcı ara, kullanıcıya tıkla ve sohbet başlat
    await driver.findElement(By.xpath("//button[contains(.,'Kullanıcı Ara') or @aria-label='Kullanıcı Ara']")).click();
    await driver.sleep(400);
    await driver.findElement(By.css('input[placeholder*="İsim veya e-posta"]')).sendKeys(user1.name);
    await driver.findElement(By.xpath("//button[text()='Ara']")).click();
    await driver.wait(until.elementLocated(By.xpath("//div[contains(@class,'chakra-avatar')]")), 5000);
    await driver.sleep(400);
    await driver.findElement(By.xpath("//div[contains(@class,'chakra-avatar')]/ancestor::div[contains(@class,'chakra-box')][1]" )).click();
    await driver.sleep(1000);

    // 8. Grup sohbeti oluşturma modalını aç, grup adı ve kullanıcı ekle, grup oluştur
    await driver.findElement(By.xpath("//button[contains(.,'Grup Sohbeti Oluştur') or @aria-label='Grup Sohbeti Oluştur']")).click();
    await driver.sleep(400);
    await driver.findElement(By.css('input[placeholder="Sohbet Adı"]')).sendKeys('Test Grubu');
    await driver.findElement(By.css('input[placeholder*="Kullanıcı ekle"]')).sendKeys(user1.name);
    await driver.wait(until.elementLocated(By.xpath("//div[contains(@class,'chakra-avatar')]/ancestor::div[contains(@class,'chakra-box')][1]")), 5000);
    await driver.sleep(400);
    await driver.findElement(By.xpath("//div[contains(@class,'chakra-avatar')]/ancestor::div[contains(@class,'chakra-box')][1]" )).click();
    await driver.findElement(By.xpath("//button[text()='Sohbet Oluştur']")).click();
    await driver.sleep(1000);

    // 9. Bir sohbete girip mesaj gönder
    await driver.wait(until.elementLocated(By.css('.messages')), 5000);
    await driver.sleep(400);
    await driver.findElement(By.css('input[placeholder="Mesajınızı girin.."]')).sendKeys('Merhaba Selenium!', Key.ENTER);
    await driver.sleep(1000);

    // 10. Grup sohbetinde grup adını değiştir, kullanıcı ekle/çıkar
    await driver.findElement(By.css('button[aria-label="Güncelle"]')).click();
    await driver.sleep(400);
    await driver.findElement(By.css('input[placeholder="Sohbet Adı"]')).clear();
    await driver.findElement(By.css('input[placeholder="Sohbet Adı"]')).sendKeys('Yeni Grup Adı');
    await driver.findElement(By.xpath("//button[text()='Güncelle']")).click();
    await driver.findElement(By.css('input[placeholder*="Gruba kullanıcı ekle"]')).sendKeys(user1.name);
    await driver.wait(until.elementLocated(By.xpath("//div[contains(@class,'chakra-avatar')]/ancestor::div[contains(@class,'chakra-box')][1]")), 5000);
    await driver.sleep(400);
    await driver.findElement(By.xpath("//div[contains(@class,'chakra-avatar')]/ancestor::div[contains(@class,'chakra-box')][1]" )).click();
    await driver.findElement(By.xpath("//span[contains(text(),'Gruptan Ayrıl')]")).click();
    await driver.sleep(1000);

    // 11. Çıkış yap
    // Profil menüsü butonunu (avatar içeren) bul ve tıkla
    const menuButtons = await driver.findElements(By.css('button.chakra-menu__menu-button'));
    let clickedProfileMenu = false;
    for (let btn of menuButtons) {
      const avatar = await btn.findElements(By.css('.chakra-avatar'));
      if (avatar.length > 0) {
        await btn.click();
        clickedProfileMenu = true;
        break;
      }
    }
    if (!clickedProfileMenu) throw new Error('Profil menüsü butonu bulunamadı!');
    await driver.sleep(2000);
    let menuItems = await driver.findElements(By.css('.chakra-menu__menuitem'));
    let foundLogout = false;
    for (let item of menuItems) {
      let text = await item.getText();
      console.log('MENUITEM:', text);
      if (text && text.includes('Çıkış Yap')) {
        await driver.sleep(2000);
        try {
          await driver.wait(until.elementIsVisible(item), 2000);
          await driver.wait(until.elementIsEnabled(item), 2000);
          await item.click();
        } catch (e) {
          await driver.executeScript('arguments[0].click();', item);
        }
        await driver.sleep(1200);
        await driver.wait(until.urlIs('http://localhost:3000/'), 10000);
        foundLogout = true;
        break;
      }
    }
    if (!foundLogout) {
      throw new Error("Çıkış Yap butonu menüde bulunamadı veya tıklanamadı!");
    }

    console.log('Tüm UI akışları başarıyla test edildi!');
  } catch (err) {
    console.error('Test sırasında hata:', err);
  } finally {
    await driver.quit();
    console.log('--- Selenium UI Full Flow Test Sonlandı ---');
  }
}

runFullUITest(); 