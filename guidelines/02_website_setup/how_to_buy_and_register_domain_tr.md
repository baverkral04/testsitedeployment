# Özel Alan Adınızı Bağlama

`www.sizinmarkaniz.com` gibi özel bir alan adı kullanmak, sitenizin profesyonel görünmesini sağlar ve marka güveni oluşturur. Bu kılavuz, Namecheap'ten bir alan adı satın alma ve onu GitHub Pages'te barındırılan web sitenizle çalışacak şekilde yapılandırma konusunda size yol gösterecektir.

Süreç iki ana bölümden oluşur:
1.  **Alan Adı Satın Alma:** Alan adınızı seçme ve satın alma.
2.  **DNS Kayıtlarını Yapılandırma:** Yeni alan adınızı GitHub'ın sunucularına yönlendirme.

---

## 1. Bölüm: Namecheap'ten Alan Adı Satın Alma

Eğer henüz bir alan adınız yoksa, Namecheap popüler ve uygun fiyatlı bir satın alma yeridir.

1.  **Namecheap'e Gidin:** Web tarayıcınızı açın ve [www.namecheap.com](https://www.namecheap.com) adresine gidin.

2.  **Alan Adı Arayın:** Ana arama çubuğunu kullanarak istediğiniz alan adını yazın (örn: `harika-markam.com`).
    * **İpucu:** İyi alan adları kısa, hatırlanması kolay ve markanızla alakalıdır.

3.  **Sepete Ekleyin:** Seçtiğiniz alan adı uygunsa, "Sepete Ekle" (Add to Cart) düğmesine tıklayın. Namecheap, web hosting veya özel e-posta gibi eklentiler sunabilir; bir GitHub Pages sitesi için **bunlara ihtiyacınız yoktur**, bu yüzden atlayabilirsiniz.

4.  **Ödeme Yapın ve Hesap Oluşturun:** Ödeme işlemine devam edin. Bir Namecheap hesabı oluşturmanız veya mevcut bir hesaba giriş yapmanız istenecektir.

5.  **WhoisGuard'ı Etkinleştirin:** Ödeme sırasında, ücretsiz **WhoisGuard** gizlilik korumasının etkinleştirildiğinden emin olun. Bu, kişisel iletişim bilgilerinizi (isim, adres, e-posta) gizli tutar.

6.  **Satın Almayı Tamamlayın:** Ödeme bilgilerinizi doldurun ve satın alma işlemini tamamlayın. Tebrikler, artık bir alan adınız var!

---

## 2. Bölüm: GitHub Pages için DNS Kayıtlarını Yapılandırma

DNS (Alan Adı Sistemi) kayıtları, internetteki trafiği yönlendiren birer tabela gibidir. Alan adınızı GitHub'ın sunucularına yönlendiren kayıtlar oluşturmamız gerekiyor.

### A Adımı: DNS Ayarlarınıza Erişme

1.  Namecheap hesabınıza giriş yapın.
2.  **Panelinizden (Dashboard)**, alan adlarınızın bir listesini göreceksiniz. Yeni alan adınızı bulun ve yanındaki **Yönet (Manage)** düğmesine tıklayın.
3.  **Gelişmiş DNS (Advanced DNS)** sekmesine gidin.
4.  Namecheap tarafından oluşturulmuş bazı varsayılan kayıtlar görebilirsiniz (genellikle bir "Park Sayfası" için). Çakışmaları önlemek için mevcut `A`, `CNAME` veya `URL Yönlendirme` kayıtlarının yanındaki çöp kutusu simgesine tıklayarak bunları silin.

### B Adımı: Gerekli Kayıtları Oluşturma

Şimdi beş yeni kayıt ekleyeceksiniz. Her biri için **"Yeni Kayıt Ekle" (Add New Record)** düğmesine tıklayın.

#### 1. `A` Kayıtları (kök alan adınız için)
Bu dört kayıt, ana alan adınızı (örn: `sizinmarkaniz.com`) GitHub'ın IP adreslerine yönlendirir. Dördünü de oluşturmanız gerekir.

| Tür (Type) | Sunucu (Host) | Değer (Value) | TTL |
| :--- | :--- | :--- | :--- |
| A Record | `@` | `185.199.108.153` | Otomatik |
| A Record | `@` | `185.199.109.153` | Otomatik |
| A Record | `@` | `185.199.110.153` | Otomatik |
| A Record | `@` | `185.199.111.153` | Otomatik |

* `@` sembolü, kök alan adınızın kendisi için bir kısaltmadır.

#### 2. `CNAME` Kaydı ('www' alt alan adı için)
Bu kayıt, adresinizin `www` sürümünün de (örn: `www.sizinmarkaniz.com`) çalışmasını sağlar.

| Tür (Type) | Sunucu (Host) | Değer (Value) | TTL |
| :--- | :--- | :--- | :--- |
| CNAME Record | `www` | `sizin-github-kullaniciadiniz.github.io` | Otomatik |

* **ÖNEMLİ:** `sizin-github-kullaniciadiniz.github.io` kısmını kendi GitHub kullanıcı adınızla (ve eğer bir proje sayfası kullanıyorsanız depo adınızla) değiştirmelisiniz. Örneğin: `kardiy-sites.github.io`.

Beş kaydı da ekledikten sonra, **"Tüm Değişiklikleri Kaydet"** onay simgesine tıklayın.

---

## Sonraki Adımlar

DNS değişiklikleri anında gerçekleşmez. İnternet genelinde "yayılması" (propagate) gerekir.
* Bu süreç birkaç dakikadan 24 saate kadar sürebilir, ancak genellikle **30 dakikadan daha kısa** sürede tamamlanır.
* Değişiklikler yayına girdiğinde, `sizinmarkaniz.com` veya `www.sizinmarkaniz.com` yazan herkes GitHub Pages'teki web sitenizin içeriğine yönlendirilecektir.

Son adımınız, GitHub depo ayarlarınızda özel alan adını yapılandırmaktır. Bu, GitHub'a yeni alan adınızdan trafik beklemesini söyler.