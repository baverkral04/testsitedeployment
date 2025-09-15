
### How to Issue a Refund in Stripe 💳

After you have received a returned item from a customer, the final step is to issue a refund through your Stripe account. This guide shows you exactly how to do that.

---
## Step 1: Find the Original Payment

First, you need to locate the customer's original payment in your Stripe dashboard.

1.  Log in to your **[Stripe Dashboard](https://dashboard.stripe.com)**.
2.  In the top menu, click on **Payments**.
3.  Use the **search bar** at the top of the Payments page to find the original charge. The easiest way is to search by the **customer's email address** or **name**.
4.  Click on the payment from the search results to open its details page.

---
## Step 2: Initiate the Refund

Once you are viewing the specific payment details, you can begin the refund process.

1.  In the top-right corner of the payment details view, click the **••• (three dots)** button, then select **Refund payment**. 
2.  A refund panel will open.

---
## Step 3: Choose Refund Options

You have a few choices to make before confirming the refund.

* **Amount:**
    * **Full Refund:** By default, Stripe fills in the full amount of the original purchase.
    * **Partial Refund:** If you only need to refund part of the order, you can type a different amount into the box.

* **Reason:**
    * From the dropdown menu, select a reason for the refund. For a standard product return, the best option is usually **"Requested by customer"**.

---
## Step 4: Confirm the Refund

Once you've set the amount and reason, click the **"Refund"** button. The refund is processed immediately, and Stripe will handle sending the funds back to the customer's original payment method.

### What Happens Next?

* **Timing:** It typically takes **5-10 business days** for the refund to appear on the customer's bank or card statement.
* **Fees:** Stripe's original processing fees for the transaction are typically not returned to you.
* **Status:** The payment status in your Stripe dashboard will update to **"Refunded"** or **"Partially Refunded"**.