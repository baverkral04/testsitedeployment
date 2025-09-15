### Stripe Üzerinden Para İadesi Nasıl Yapılır 💳

Müşteriden iade edilen bir ürünü teslim aldıktan sonraki son adım, Stripe hesabınız üzerinden para iadesi yapmaktır. Bu kılavuz size bunu tam olarak nasıl yapacağınızı gösterir.

---
## 1. Adım: Orijinal Ödemeyi Bulma

Öncelikle, müşterinin orijinal ödemesini Stripe panelinizde bulmanız gerekir.

1.  **[Stripe Panelinize](https://dashboard.stripe.com)** giriş yapın.
2.  Üst menüde **Ödemeler (Payments)** seçeneğine tıklayın.
3.  Orijinal ödemeyi bulmak için Ödemeler sayfasının üst kısmındaki **arama çubuğunu** kullanın. En kolay yol, **müşterinin e-posta adresi** veya **adıyla** aramaktır.
4.  Arama sonuçlarından ilgili ödemeye tıklayarak detay sayfasını açın.

---
## 2. Adım: İade İşlemini Başlatma

İlgili ödemenin ayrıntılarını görüntülerken iade sürecini başlatabilirsiniz.

1.  Ödeme ayrıntıları görünümünün sağ üst köşesindeki **••• (üç nokta)** düğmesine tıklayın ve ardından **Geri Ödeme Yap (Refund payment)** seçeneğini seçin.
2.  Bir iade paneli açılacaktır.

---
## 3. Adım: İade Seçeneklerini Belirleme

İadeyi onaylamadan önce yapmanız gereken birkaç seçim vardır.

* **Tutar:**
    * **Tam İade:** Varsayılan olarak, Stripe orijinal satın alma işleminin tam tutarını girer.
    * **Kısmi İade:** Siparişin yalnızca bir kısmını iade etmeniz gerekiyorsa, kutuya farklı bir tutar yazabilirsiniz.

* **Neden:**
    * Açılır menüden iade için bir neden seçin. Standart bir ürün iadesi için en iyi seçenek genellikle **"Müşteri tarafından talep edildi" (Requested by customer)** seçeneğidir.

---
## 4. Adım: İadeyi Onaylama

Tutarı ve nedeni ayarladıktan sonra **"Geri Öde" (Refund)** düğmesine tıklayın. İade anında işleme alınır ve Stripe, parayı müşterinin orijinal ödeme yöntemine geri göndermeyi yönetir.

### Sonraki Adımlar

* **Zamanlama:** İadenin müşterinin banka veya kart ekstresinde görünmesi genellikle **5-10 iş günü** sürer.
* **İşlem Ücretleri:** Stripe'ın işlem için aldığı orijinal işlem ücretleri genellikle size iade edilmez.
* **Durum:** Stripe panelinizdeki ödeme durumu **"İade Edildi" (Refunded)** veya **"Kısmen İade Edildi" (Partially Refunded)** olarak güncellenecektir.