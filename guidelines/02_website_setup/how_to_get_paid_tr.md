
### Web Siteniz İçin Stripe Hesabı Nasıl Kurulur

Stripe, web sitenizde kredi kartı ödemeleri kabul etmenizi sağlayan güvenli ve yaygın olarak kullanılan bir platformdur. Bu kılavuz, bir hesap oluşturma, gerçek ödemeleri kabul etmek için hesabınızı etkinleştirme ve sitenizin yönetim paneli için ihtiyaç duyacağınız API anahtarlarını bulma konusunda size yol gösterecektir.

---

## 1. Bölüm: Stripe Hesabınızı Oluşturma

Öncelikle kayıt olmanız gerekir.

1.  **[Stripe web sitesine](https://dashboard.stripe.com/register)** gidin.
2.  Temel bilgilerinizi girin: **e-posta**, **tam adınız** ve **güvenli bir şifre**.
3.  **"Hesap oluştur" (Create account)** düğmesine tıklayın. E-posta adresinizi doğrulamanız istenecektir. Doğrulamadan sonra Stripe Panelinize giriş yapmış olacaksınız.

Başlangıçta hesabınız, gerçek para kullanmadan işlemleri simüle etmenizi sağlayan **"test modundadır"**. Gerçek ödemeleri kabul etmek için hesabınızı etkinleştirmeniz gerekir.

---

## 2. Bölüm: Hesabınızı Etkinleştirme

Stripe Panelinizin sol üst köşesinde, **"Hesabınızı etkinleştirin" (Activate your account)** yazan bir düğme göreceksiniz. Etkinleştirme sürecini başlatmak için bu düğmeye tıklayın.

Doğrulama için işletmeniz ve kendiniz hakkında bilgi vermeniz gerekecektir. Bu, dolandırıcılığı önlemek için yasalarca zorunludur.

1.  **İşletme Detayları:**
    * **İşletme Yapısı:** İşletme türünüzü seçin (örn: Şahıs Şirketi, Limited Şirket).
    * **İşletme Bilgileri:** İşletmenizin yasal adını, adresini ve telefon numarasını girin.
    * **Web Siteniz:** Ürün satacağınız web sitesinin alan adını girin.

2.  **Kişisel Detaylar:**
    * Yasal adınızı, doğum tarihinizi ve ev adresinizi belirtin. Bu, işletme sahibi olarak kimliğinizi doğrulamak için kullanılır.

3.  **Banka Hesabı Detayları:**
    * Stripe'tan ödemelerinizi almak istediğiniz banka hesabının **IBAN numarasını** girin.

4.  **Hesap Güvenliği:**
    * Bir doğrulama uygulaması veya SMS kullanarak **İki Faktörlü Kimlik Doğrulama (2FA)** kurun. Bu, hesabınızı güvende tutmak için çok önemli bir adımdır.

Formu gönderdikten sonra Stripe bilgilerinizi inceleyecektir. Onay genellikle çok hızlıdır, çoğu zaman anında gerçekleşir.

---

## 3. Bölüm: API Anahtarlarınızı Bulma 🔑

API anahtarları, web sitenizin Stripe hesabınızla güvenli bir şekilde iletişim kurmasını sağlayan özel şifreler gibidir. Bu anahtarları kopyalayıp web sitenizin yönetim paneline yapıştırmanız gerekecektir.

1.  Stripe Panelinizde, sağ üstteki menüden **"Geliştiriciler" (Developers)** seçeneğine tıklayın.
2.  Geliştiriciler sayfasında, sol kenar çubuğundaki **"API anahtarları" (API keys)** seçeneğine tıklayın.
3.  İki önemli anahtar göreceksiniz:
    * **Yayınlanabilir Anahtar (Publishable Key):** Bu anahtarın web sitenizin herkese açık kodunda kullanılması güvenlidir. `pk_` ile başlar.
    * **Gizli Anahtar (Secret Key):** Bu anahtar son derece hassastır ve **sadece** sunucunuzda veya güvenli bir yönetim panelinde kullanılmalıdır. **Asla halka açık bir şekilde paylaşmayın.** `sk_` ile başlar.

**Önemli:** Varsayılan olarak, **Test API anahtarlarınızı** görüntülersiniz. Gerçek ödemeleri işlemek için anahtarları almak amacıyla, sağ üst köşedeki **"Test verilerini görüntüle" (View test data)** anahtarını kapatarak **canlı moda** geçmelisiniz.

Yönetim panelinizdeki `brand_stripeToken` alanı için **Canlı Gizli Anahtarınıza** (`sk_live_...` ile başlayan) ihtiyacınız olacaktır. Bu anahtarı ekledikten sonra web siteniz gerçek ödemeleri kabul etmeye hazır olacaktır.