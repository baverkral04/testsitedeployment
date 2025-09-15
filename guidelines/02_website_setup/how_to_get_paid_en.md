
### How to Set Up a Stripe Account for Your Website

Stripe is a secure and widely used platform that allows you to accept credit card payments on your website. This guide will walk you through creating an account, activating it to accept real payments, and finding the API keys you'll need for your site's admin panel.

---

## Part 1: Create Your Stripe Account

First, you'll need to register.

1.  Go to the **[Stripe website](https://dashboard.stripe.com/register)**.
2.  Fill in your basic details: **email**, **full name**, and a **secure password**.
3.  Click **"Create account"**. You'll be asked to verify your email address. After verification, you will be logged into your Stripe Dashboard.

Initially, your account is in **"test mode,"** which lets you simulate transactions without using real money. To accept actual payments, you must activate your account.

---

## Part 2: Activate Your Account

In the top left of your Stripe Dashboard, you will see a button that says **"Activate your account"** or **"Start now"**. Click it to begin the activation process. 

You will need to provide information about your business and yourself for verification. This is required by law to prevent fraud.

1.  **Business Details:**
    * **Business Structure:** Select your business type (e.g., Sole Proprietorship, LLC).
    * **Business Information:** Enter your business's legal name, address, and phone number.
    * **Your Website:** Enter the domain of the website where you'll be selling products.

2.  **Personal Details:**
    * Provide your legal name, date of birth, and home address. This is used to verify your identity as the business owner.

3.  **Bank Account Details:**
    * Enter the **routing number** and **account number** for the bank account where you want to receive your payouts from Stripe.

4.  **Account Security:**
    * Set up **Two-Factor Authentication (2FA)** using an authenticator app or SMS. This is a crucial step to keep your account secure.

After submitting the form, Stripe will review your information. Approval is usually very fast, often instant.

---

## Part 3: Finding Your API Keys 🔑

API keys are like special passwords that allow your website to communicate securely with your Stripe account. You will need to copy these keys and paste them into your website's admin panel.

1.  In your Stripe Dashboard, click on **"Developers"** in the top-right menu.
2.  On the Developers page, click on **"API keys"** in the left-hand sidebar.
3.  You will see two important keys:
    * **Publishable Key:** This key is safe to use in your website's public-facing code. It starts with `pk_`.
    * **Secret Key:** This key is highly sensitive and should **only** be used on your server or in a secure admin panel. **Never share it publicly.** It starts with `sk_`.

**Important:** By default, you will be viewing your **Test API keys**. To get the keys for processing real payments, you must toggle the **"View test data"** switch in the top-right corner to **"View live data"**. 

You will need your **Live Secret Key** (starting with `sk_live_...`) for the `brand_stripeToken` field in your admin dashboard. Once you've added this key, your website will be ready to accept real payments.