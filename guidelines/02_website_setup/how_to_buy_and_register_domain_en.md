# Connecting Your Custom Domain

Using a custom domain like `www.yourbrand.com` makes your site look professional and builds brand trust. This guide will walk you through purchasing a domain from Namecheap and configuring it to work with your website hosted on GitHub Pages.

The process has two main parts:
1.  **Purchasing the Domain:** Choosing and buying your domain name.
2.  **Configuring DNS Records:** Pointing your new domain to GitHub's servers.

---

## Part 1: Purchasing a Domain on Namecheap

If you don't already own a domain, Namecheap is a popular and affordable place to buy one.

1.  **Go to Namecheap:** Open your web browser and navigate to [www.namecheap.com](https://www.namecheap.com).

2.  **Search for a Domain:** Use the main search bar to type in the domain name you want (e.g., `my-awesome-brand.com`).
    * **Tip:** Good domain names are short, easy to remember, and relevant to your brand.

3.  **Add to Cart:** If your chosen domain is available, click the "Add to Cart" button. Namecheap may offer add-ons like web hosting or private email; for a GitHub Pages site, you **do not need these**, so you can skip them.

4.  **Checkout and Create Account:** Proceed to checkout. You will be prompted to create a Namecheap account or log in to an existing one.

5.  **Enable WhoisGuard:** During checkout, ensure the free **WhoisGuard** privacy protection is enabled. This keeps your personal contact information (name, address, email) private.

6.  **Complete Purchase:** Fill in your payment details and complete the purchase. Congratulations, you now own a domain!

---

## Part 2: Configuring DNS Records for GitHub Pages

DNS (Domain Name System) records are like signposts on the internet that direct traffic. We need to create records that point your domain to GitHub's servers.

### Step A: Access Your DNS Settings

1.  Log in to your Namecheap account.
2.  From your **Dashboard**, you will see a list of your domains. Find your new domain and click the **Manage** button next to it.
3.  Navigate to the **Advanced DNS** tab.
4.  You may see some default records created by Namecheap (often for a "Parking Page"). Click the trash can icon next to any existing `A`, `CNAME`, or `URL Redirect` records to delete them. This prevents conflicts.

### Step B: Create the Required Records

You will now add five new records. Click the **"Add New Record"** button for each one.

#### 1. The `A` Records (for your root domain)
These four records point your main domain (e.g., `yourbrand.com`) to GitHub's IP addresses. You need to create all four.

| Type | Host | Value (IP Address) | TTL |
| :--- | :--- | :--- | :--- |
| A Record | `@` | `185.199.108.153` | Automatic |
| A Record | `@` | `185.199.109.153` | Automatic |
| A Record | `@` | `185.199.110.153` | Automatic |
| A Record | `@` | `185.199.111.153` | Automatic |

* The `@` symbol is a shorthand for your root domain itself.

#### 2. The `CNAME` Record (for the 'www' subdomain)
This record ensures that the `www` version of your address (e.g., `www.yourbrand.com`) also works.

| Type | Host | Value (Target) | TTL |
| :--- | :--- | :--- | :--- |
| CNAME Record | `www` | `your-github-username.github.io` | Automatic |

* **IMPORTANT:** You must replace `your-github-username.github.io` with your actual GitHub username and the name of your repository if you're using a project page. For example: `kardiy-sites.github.io`.

After adding all five records, click the **"Save All Changes"** checkmark icon.

---

## What Happens Next?

DNS changes are not instant. They need to "propagate" across the internet.
* This process can take anywhere from a few minutes to 24 hours, but it's often complete in **under 30 minutes**.
* Once the changes are live, anyone who types `yourbrand.com` or `www.yourbrand.com` will be directed to your website's content on GitHub Pages.

Your final step is to configure the custom domain within your GitHub repository's settings. This tells GitHub to expect traffic from your new domain.