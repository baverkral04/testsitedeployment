(async () => {
  const API_ROOT = `${window.API_HOST}/api/${window.CUSTOMER_ID}`;
  const form = document.getElementById('signin-form');
  if (!form) return;

  const emailInput = document.getElementById('signin-email');
  const passwordInput = document.getElementById('signin-password');
  const msg = document.getElementById('signin-msg');

  try {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get('oauth_error');
    if (oauthError && msg) {
      msg.textContent = oauthError;
      msg.className = 'gl-text u-s-m-b-15 u-c-brand';
      showToast?.(oauthError, { type: 'error' });
    }
  } catch (_) {
    // Ignore malformed URLs
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!emailInput || !passwordInput) {
      showToast('We couldn\'t find the sign-in fields. Please refresh and try again.', { type: 'error' });
      return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    try {
      if (msg) {
        msg.textContent = 'Signing in...';
        msg.className = 'gl-text u-s-m-b-15';
      }

      const res = await fetch(`${API_ROOT}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        let err = `${res.status} ${res.statusText}`;
        try {
          const body = await res.json();
          if (body?.error) err = body.error;
        } catch (_) {}
        throw new Error(err);
      }

      await window.checkSession?.();
      window.location.href = 'dashboard.html';
    } catch (err) {
      console.error(err);
      if (msg) {
        msg.textContent = err.message;
        msg.className = 'gl-text u-s-m-b-15 u-c-brand';
      }
      showToast(err?.message || 'We couldn\'t sign you in. Please try again.', { type: 'error' });
    }
  });
})();
