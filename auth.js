// auth.js
(() => {
  const DEBUG = true;
  const log = (...args) => DEBUG && console.log('[AUTH]', ...args);

  // match your Flask DB filename (same ID you use in admin.js)
  const customerId = 'products_test_user';
  const API_BASE   = `http://localhost:5050/api/${customerId}/auth`;

  async function fetchJSON(url, opts = {}) {
    log('→', opts.method || 'GET', url, opts);
    const res = await fetch(url, opts);
    log('← status', res.status, res.statusText);
    let body = null;
    try {
      body = await res.json();
      log('← body', body);
    } catch { log('← non-JSON response'); }
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return body;
  }

  // Load current user into window.currentUser (null if not signed in)
  async function loadCurrentUser() {
    try {
      const user = await fetchJSON(`${API_BASE}/current_user`);
      window.currentUser = user ? { ...user } : null;
      log('Loaded current user', user);
    } catch (e) {
      window.currentUser = null;
      log('No active user session');
    }
  }

  // Call this to sign in; returns user object on success
  async function login(username, password) {
    const payload = { user_email: username, user_password: password };
    const user = await fetchJSON(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    window.currentUser = { ...user };
    return user;
  }

  // Call this to sign out
  async function logout() {
    await fetchJSON(`${API_BASE}/logout`, { method: 'POST' });
    window.currentUser = null;
  }

  // Expose to global
  window.loadCurrentUser = loadCurrentUser;
  window.login           = login;
  window.logout          = logout;

  // Auto-bootstrap on script include
  loadCurrentUser();
})();
