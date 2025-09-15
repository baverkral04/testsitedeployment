You can secure your domain for free using Cloudflare by creating a free account, adding your site, and then changing your domain's nameservers at your registrar (like Namecheap or GoDaddy) to the ones Cloudflare provides. This routes your website traffic through Cloudflare, which then provides a free SSL certificate, enabling the secure `https://` protocol.

***
### How to Secure Your Domain with Cloudflare (Free SSL)

Cloudflare is a service that acts as a middleman between your visitors and your website. It offers a free plan that includes an SSL certificate, which encrypts the connection to your site and protects your visitors' data. The process involves pointing your domain to Cloudflare, and then pointing Cloudflare to your website's server.

### Step 1: Create a Cloudflare Account

1.  Go to the **Cloudflare signup page** and create a free account with your email and a password.

### Step 2: Add Your Website to Cloudflare

1.  Once logged in, click the **"+ Add a Site"** button.
2.  Enter your root domain name (e.g., `yourbrand.com`) and click **"Add site"**.
3.  Select the **Free plan** and click **"Continue"**. Cloudflare will then scan for your existing DNS records.

### Step 3: Update Your Nameservers

This is the most critical step. You must tell your domain registrar (the company where you bought your domain) to let Cloudflare manage your domain's traffic.

1.  Cloudflare will provide you with **two new Cloudflare nameservers**. They will look something like `chad.ns.cloudflare.com` and `lucy.ns.cloudflare.com`. Copy these.
2.  Log in to your account where you purchased your domain (e.g., Namecheap, GoDaddy).
3.  Find the DNS or nameserver settings for your domain and replace the existing nameservers with the two you copied from Cloudflare. 
4.  Save your changes. Then, go back to the Cloudflare tab and click the **"Done, check nameservers"** button.

### Step 4: Configure SSL/TLS Settings

This step activates the security features.

1.  In your Cloudflare dashboard, select your website.
2.  Go to the **SSL/TLS** tab.
3.  For the encryption mode, select **Full**. This encrypts the entire connection from your visitor to your server.
4.  Next, click on the **"Edge Certificates"** sub-tab.
5.  Find the **"Always Use HTTPS"** option and toggle it **On**. This automatically redirects all `http://` traffic to the secure `https://` version.

It may take a few hours for the nameserver changes to update across the internet. Cloudflare will email you when your site is active and secured.