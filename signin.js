(async () => {
  // Match the customerId with your Flask DB filename (e.g. customer_dbs/exampleCustomer.db)
  const customerId = 'products_test_user';
  const API_BASE = `http://localhost:5050/api/${customerId}/users`;

  /**
   * Log helper for debugging sign‑in actions. Adjust or disable as needed.
   */
  function log(...args) {
    console.log('[SIGNIN]', ...args);
  }

  /**
   * Perform a fetch request and parse the JSON response. Throws an error for non‑OK responses.
   * Mirrors the fetchJSON helper in user_admin_panel.js for consistent behavior.
   * @param {string} url
   * @param {Object} opts
   * @returns {Promise<any>}
   */
  async function fetchJSON(url, opts = {}) {
    log('fetchJSON →', url, opts);
    const res = await fetch(url, opts);
    log('fetchJSON ← status', res.status, res.statusText);
    let data;
    try {
      data = await res.json();
      log('fetchJSON ← body', data);
    } catch (e) {
      log('fetchJSON ← no‑json body');
    }
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return data;
  }

  /**
   * Retrieve the user table schema from the backend. Used to identify username/email and password fields dynamically.
   * @returns {Promise<string[]>}
   */
  async function getSchema() {
    return await fetchJSON(`${API_BASE}/schema`);
  }

  // Identify the login form on the page. Assumes the first form is the sign‑in form.
  const form = document.querySelector('form');
  if (!form) return;

  // Attempt to find username/email and password input fields within the form.
  const usernameInput = form.querySelector('input[type="email"], input[type="text"]');
  const passwordInput = form.querySelector('input[type="password"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!usernameInput || !passwordInput) {
      alert('Unable to find login fields.');
      return;
    }
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    try {
      // Determine which columns correspond to username/email and password
      const schema = await getSchema();
      const userField = schema.find((c) => /email|username|user_name|userName/i.test(c)) || schema[0];
      const passField = schema.find((c) => /password|pass|pwd/i.test(c)) || schema[1];
      // Fetch all users and search for a matching record
      const users = await fetchJSON(API_BASE);
      const user = users.find((u) => String(u[userField]) === username && String(u[passField]) === password);
      if (user) {
        // Persist the user in localStorage and redirect
        setCurrentUser(user);
        window.location.href = 'index.html';  // change to the page you want after sign‑in
      } else {
        alert('Invalid credentials, please try again.');
      }
    } catch (err) {
      alert('Error signing in: ' + err.message);
    }
  });
})();