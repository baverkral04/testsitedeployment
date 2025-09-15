

Cloudflare kullanarak alan adınızı ücretsiz olarak güvence altına alabilirsiniz. Bunun için ücretsiz bir hesap oluşturmanız, sitenizi eklemeniz ve ardından alan adı kayıt firmanızdaki (Namecheap veya GoDaddy gibi) ad sunucularını (nameserver) Cloudflare'in sağladıklarıyla değiştirmeniz gerekir. Bu işlem, web sitesi trafiğinizi Cloudflare üzerinden yönlendirir ve bu sayede güvenli `https://` protokolünü etkinleştiren ücretsiz bir SSL sertifikası sağlanır.

-----

### Alan Adınızı Cloudflare ile Güvence Altına Alma (Ücretsiz SSL)

Cloudflare, ziyaretçileriniz ve web siteniz arasında bir aracı görevi gören bir hizmettir. Sitenize olan bağlantıyı şifreleyen ve ziyaretçilerinizin verilerini koruyan bir SSL sertifikası içeren ücretsiz bir plan sunar. Süreç, alan adınızı Cloudflare'e, ardından Cloudflare'i de web sitenizin sunucusuna yönlendirmeyi içerir.

### 1\. Adım: Cloudflare Hesabı Oluşturma

1.  **[Cloudflare kayıt sayfasına](https://www.google.com/search?q=https://dash.cloudflare.com/sign-up)** gidin ve e-postanız ve bir şifre ile ücretsiz bir hesap oluşturun.

### 2\. Adım: Web Sitenizi Cloudflare'e Ekleme

1.  Giriş yaptıktan sonra, **"+ Site Ekle" (+ Add a Site)** düğmesine tıklayın.
2.  Kök alan adınızı girin (örn: `sizinmarkaniz.com`) ve **"Site ekle" (Add site)** düğmesine tıklayın.
3.  **Ücretsiz planı (Free plan)** seçin ve **"Devam Et" (Continue)** düğmesine tıklayın. Cloudflare daha sonra mevcut DNS kayıtlarınızı tarayacaktır.

### 3\. Adım: Ad Sunucularınızı (Nameserver) Güncelleme

Bu en kritik adımdır. Alan adı kayıt firmanıza (alan adınızı satın aldığınız şirket), alan adınızın trafiğini Cloudflare'in yönetmesine izin vermelisiniz.

1.  Cloudflare size **iki yeni Cloudflare ad sunucusu** sağlayacaktır. Bunlar `chad.ns.cloudflare.com` ve `lucy.ns.cloudflare.com` gibi görünecektir. Bunları kopyalayın.
2.  Alan adınızı satın aldığınız yerdeki hesabınıza giriş yapın (örn: Namecheap, GoDaddy).
3.  Alan adınız için DNS veya ad sunucusu ayarlarını bulun ve mevcut ad sunucularını Cloudflare'den kopyaladığınız iki tanesiyle değiştirin.
4.  Değişikliklerinizi kaydedin. Ardından, Cloudflare sekmesine geri dönün ve **"Bitti, ad sunucularını kontrol et" (Done, check nameservers)** düğmesine tıklayın.

### 4\. Adım: SSL/TLS Ayarlarını Yapılandırma

Bu adım güvenlik özelliklerini etkinleştirir.

1.  Cloudflare panelinizde web sitenizi seçin.
2.  **SSL/TLS** sekmesine gidin.
3.  Şifreleme modu için **Tam (Full)** seçeneğini seçin. Bu, ziyaretçinizden sunucunuza kadar olan tüm bağlantıyı şifreler.
4.  Ardından, **"Uç Sertifikaları" (Edge Certificates)** alt sekmesine tıklayın.
5.  **"Her Zaman HTTPS Kullan" (Always Use HTTPS)** seçeneğini bulun ve **Açık** konuma getirin. Bu, tüm `http://` trafiğini otomatik olarak güvenli `https://` sürümüne yönlendirir.

Ad sunucusu değişikliklerinin internet genelinde güncellenmesi birkaç saat sürebilir. Siteniz aktif ve güvende olduğunda Cloudflare size e-posta gönderecektir.