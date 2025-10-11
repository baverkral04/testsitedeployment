// ====== Auth + User State (frontend-only) ======
// All shared variables are explicitly attached to the global 'window' object.
window.CUSTOMER_ID = window.CUSTOMER_ID || 'products_test_user';
window.customerId = window.CUSTOMER_ID; // Alias for admin.js compatibility
window.API_HOST = 'http://localhost:5050';
window.API_ROOT = `${window.API_HOST}/api/${window.CUSTOMER_ID}`;

// Global placeholders for brand information
window.BRAND_NAME = 'Loading...';
window.BRAND_LOGO_PATH = '';
window.PHONE_NUMBER = '';
window.EMAIL = '';
window.ADDRESS = '';
window.FACEBOOK_ADDRESS = '#';
window.INSTAGRAM_ADDRESS = '#';
window.TIKTOK_ADDRESS = '#';
window.STRIPE_TOKEN = '';
window.BRAND_THEME = 'css/app.css';

const THEME_DEFAULT = 'css/app.css';
let themeObserverSetup = false;
const OAUTH_SUPPORTED_PROVIDERS = new Set(['google', 'facebook']);

function resolveThemeHref(themePath) {
  const value = (themePath || '').trim();
  if (!value) return THEME_DEFAULT;
  if (/^https?:\/\//i.test(value) || value.startsWith('/')) return value;
  return value;
}

function updateThemeLink(link, href) {
  if (!link) return;
  link.dataset.themeLink = 'true';
  if (link.getAttribute('href') !== href) {
    link.setAttribute('href', href);
  }
}

function ensureThemeObserver() {
  if (themeObserverSetup) return;
  themeObserverSetup = true;
  const observer = new MutationObserver((mutations) => {
    const resolved = resolveThemeHref(window.BRAND_THEME);
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== 1) return;
        if (node.matches && node.matches('link[rel="stylesheet"]')) {
          const href = node.getAttribute('href') || '';
          if (/css\/app/i.test(href) || /css\/designs\//i.test(href)) {
            updateThemeLink(node, resolved);
          }
        }
        if (node.querySelectorAll) {
          node.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
            const href = link.getAttribute('href') || '';
            if (/css\/app/i.test(href) || /css\/designs\//i.test(href)) {
              updateThemeLink(link, resolved);
            }
          });
        }
      });
    });
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

function applyThemeStylesheet(themePath) {
  const resolved = resolveThemeHref(themePath);
  window.BRAND_THEME = resolved;
  ensureThemeObserver();

  const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  const themeLinks = links.filter((link) => {
    if (link.dataset.themeLink === 'true') return true;
    const href = link.getAttribute('href') || '';
    return /css\/app/i.test(href) || /css\/designs\//i.test(href);
  });

  if (!themeLinks.length) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    updateThemeLink(link, resolved);
    (document.head || document.documentElement).appendChild(link);
  } else {
    themeLinks.forEach((link) => updateThemeLink(link, resolved));
  }
}
window.applyThemeStylesheet = applyThemeStylesheet;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => applyThemeStylesheet(window.BRAND_THEME));
} else {
  applyThemeStylesheet(window.BRAND_THEME);
}

function defaultOAuthRedirect() {
  try {
    const currentUrl = new URL(window.location.href);
    const redirectParam = currentUrl.searchParams.get('redirect');
    if (redirectParam) {
      return redirectParam;
    }
  } catch (_) {
    // ignore URL parsing errors and fall back to default
  }
  return `${window.location.origin}/dashboard.html`;
}

function startOAuth(provider, options = {}) {
  const normalized = (provider || '').toLowerCase();
  if (!OAUTH_SUPPORTED_PROVIDERS.has(normalized)) {
    showToast?.('Unsupported sign-in provider selected.', { type: 'error' });
    return;
  }

  const redirectTarget = options.redirect || defaultOAuthRedirect();
  try {
    const url = new URL(`${window.API_ROOT}/auth/${normalized}/start`);
    if (redirectTarget) {
      url.searchParams.set('redirect', redirectTarget);
    }
    window.location.href = url.toString();
  } catch (error) {
    console.error('Failed to start OAuth flow:', error);
    showToast?.('We could not open the sign-in provider. Please try again.', { type: 'error' });
  }
}
window.startOAuth = startOAuth;

function setupOAuthButtons() {
  document.querySelectorAll('[data-oauth-provider]').forEach((button) => {
    if (button.dataset.oauthBound === 'true') return;
    button.dataset.oauthBound = 'true';

    button.addEventListener('click', (event) => {
      event.preventDefault();
      const provider = button.dataset.oauthProvider;
      const redirectOverride = button.dataset.oauthRedirect || defaultOAuthRedirect();
      startOAuth(provider, { redirect: redirectOverride });
    });
  });
}

// -----------------------------------------------------------------
// Global toast notifications (lightweight, reusable feedback system)
// -----------------------------------------------------------------
(function initGlobalToasts() {
  if (window.__TOASTS_INITIALIZED__) return;
  window.__TOASTS_INITIALIZED__ = true;

  const STYLE_ID = 'global-toast-styles';
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .global-toast-container {
        position: fixed;
        top: 24px;
        right: 24px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        z-index: 2147483647;
        pointer-events: none;
      }

      .global-toast {
        min-width: 260px;
        max-width: min(360px, calc(100vw - 32px));
        padding: 14px 18px;
        border-radius: 16px;
        background: linear-gradient(135deg, #1f2937, #111827);
        color: #ffffff;
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 0.01em;
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.18);
        display: flex;
        align-items: center;
        gap: 12px;
        opacity: 0;
        transform: translateY(-12px);
        transition: opacity 0.28s ease, transform 0.28s ease;
        pointer-events: auto;
      }

      .global-toast.is-visible {
        opacity: 1;
        transform: translateY(0);
      }

      .global-toast__text {
        flex: 1;
        line-height: 1.45;
      }

      .global-toast--success { background: linear-gradient(135deg, #22c55e, #15803d); }
      .global-toast--error   { background: linear-gradient(135deg, #ef4444, #b91c1c); }
      .global-toast--warning { background: linear-gradient(135deg, #f59e0b, #d97706); }
      .global-toast--info    { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }

      @media (max-width: 575px) {
        .global-toast-container {
          top: auto;
          bottom: 20px;
          right: 50%;
          transform: translateX(50%);
          align-items: center;
        }
      }
    `;
    document.head.appendChild(style);
  }

  const pending = [];
  let container = null;

  const flushPending = () => {
    while (pending.length) {
      const { message, options } = pending.shift();
      createToast(message, options);
    }
  };

  const ensureContainer = () => {
    if (container) return container;
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', () => {
        ensureContainer();
        flushPending();
      }, { once: true });
      return null;
    }

    container = document.createElement('div');
    container.className = 'global-toast-container';
    container.setAttribute('role', 'status');
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
    return container;
  };

  const createToast = (message, options) => {
    const root = ensureContainer();
    if (!root) {
      pending.push({ message, options });
      return;
    }

    const { type = 'info', duration = 4000 } = options || {};
    const toast = document.createElement('div');
    toast.className = `global-toast global-toast--${type}`;
    toast.innerHTML = `<span class="global-toast__text">${message}</span>`;
    root.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('is-visible');
    });

    const removeToast = () => {
      toast.classList.remove('is-visible');
      setTimeout(() => {
        toast.remove();
      }, 280);
    };

    const hideTimer = setTimeout(removeToast, duration);

    toast.addEventListener('mouseenter', () => clearTimeout(hideTimer));
    toast.addEventListener('mouseleave', () => setTimeout(removeToast, 1500));
    toast.addEventListener('click', removeToast);
  };

  window.showToast = (message, options = {}) => {
    if (!message) return;
    createToast(String(message), options);
  };

  ensureContainer();
})();

// -----------------------------------------------------------------
// Global error overlay (displayed when we cannot reach backend APIs)
// -----------------------------------------------------------------
(function initGlobalErrorOverlay() {
  if (window.__ERROR_OVERLAY_INITIALIZED__) return;
  window.__ERROR_OVERLAY_INITIALIZED__ = true;

  const STYLE_ID = 'global-error-overlay-styles';
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .global-error-overlay {
        position: fixed;
        inset: 0;
        background: linear-gradient(135deg, rgba(30, 41, 59, 0.92), rgba(15, 23, 42, 0.96));
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 24px;
        z-index: 2147483646;
        color: #e2e8f0;
        text-align: center;
      }

      .global-error-overlay h1 {
        font-size: clamp(26px, 4vw, 34px);
        margin-bottom: 12px;
        color: #ffffff;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }

      .global-error-overlay p {
        max-width: 520px;
        font-size: 16px;
        line-height: 1.6;
        margin-bottom: 28px;
        color: #cbd5f5;
      }

      .global-error-overlay button {
        border: none;
        border-radius: 999px;
        padding: 12px 30px;
        font-size: 15px;
        font-weight: 600;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        background: linear-gradient(135deg, #6366f1, #3b82f6);
        color: #ffffff;
        cursor: pointer;
        box-shadow: 0 18px 40px rgba(59, 130, 246, 0.28);
      }

      .global-error-overlay button:hover {
        transform: translateY(-1px);
      }

      .global-error-overlay button:disabled {
        opacity: 0.7;
      }
    `;
    document.head.appendChild(style);
  }

  window.showGlobalError = (message = "We're having trouble reaching our servers. Please try again.") => {
    if (window.__GLOBAL_ERROR_SHOWN__) return;
    window.__GLOBAL_ERROR_SHOWN__ = true;

    const overlay = document.createElement('div');
    overlay.className = 'global-error-overlay';
    overlay.innerHTML = `
      <h1>We'll Be Right Back</h1>
      <p>${message}</p>
      <button type="button">Try Again</button>
    `;

    const attachOverlay = () => document.body.appendChild(overlay);
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', attachOverlay, { once: true });
    } else {
      attachOverlay();
    }

    const preloader = document.querySelector('.preloader');
    if (preloader) preloader.classList.remove('is-active');

    const button = overlay.querySelector('button');
    button.addEventListener('click', () => {
      button.disabled = true;
      button.textContent = 'Refreshing…';
      window.location.reload();
    });
  };
})();

// =================================================================
// 1. CORE USER FUNCTIONS
// =================================================================
window.currentUser = null

async function checkSession() {
    console.log("1. [checkSession] Starting session check...");
    try {
         const response = await fetch(`${window.API_ROOT}/auth/current_user`, {
            credentials: 'include'
         });

         console.log("2. [checkSession] Received response from server with status:", response.status);

         if (response.status === 200) {
             const user = await response.json();
             console.log("3. [checkSession] Server returned user data:", user);
             setCurrentUser(user);
         } else if (response.status === 204) {
             console.log("3. [checkSession] No active session (204). Clearing state.");
             setCurrentUser(null);
         } else {
             console.warn("3. [checkSession] Unexpected status, clearing session.", response.status);
             setCurrentUser(null);
         }
     } catch (error) {
         console.error("Session check failed:", error);
         setCurrentUser(null);
     }
 }
window.checkSession = checkSession;


function getCurrentUser() {
  return window.currentUser;
}
window.getCurrentUser = getCurrentUser;

function setCurrentUser(user, silent = false) {
  window.currentUser = user ? { ...user } : null;

  if (window.currentUser) {
    const roleValue = window.currentUser.role || window.currentUser.user_role;
    if (roleValue) {
      window.currentUser.role = roleValue;
      window.currentUser.user_role = roleValue;
    }
  }

  if (!silent) {
    document.dispatchEvent(new CustomEvent('user:changed', { detail: window.currentUser }));
  }
}
window.setCurrentUser = setCurrentUser;

async function logout() {
    try {
        await fetch(`${window.API_ROOT}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error("Logout request failed:", error);
    } finally {
        // Whether the request succeeds or fails, clear the frontend state and redirect.
        setCurrentUser(null);
        window.location.href = 'index.html'; // Or your homepage
    }
}
window.logout = logout;
// =================================================================
// 2. UI UPDATE FUNCTIONS (USER & BRAND)
// =================================================================


function updateUserUI() {
  const user = getCurrentUser();
  const isSignedIn = !!user;
  const isGuest = !isSignedIn;

  const isSuperAdmin = isSignedIn && user.role === 'super_admin';
  const isAdmin = isSignedIn && user.role === 'admin';
  const isAnyAdmin = isSuperAdmin || isAdmin;

  document.querySelectorAll('[data-show-when="signed-in"]').forEach(el => {
      el.style.display = isSignedIn ? '' : 'none';
  });
  document.querySelectorAll('[data-show-when="guest"]').forEach(el => {
      el.style.display = isGuest ? '' : 'none';
  });
  document.querySelectorAll('[data-show-when="super-admin"]').forEach(el => {
      el.style.display = isSuperAdmin ? '' : 'none';
  });
  document.querySelectorAll('[data-show-when="any-admin"]').forEach(el => {
      el.style.display = isAnyAdmin ? '' : 'none';
  });

  const nameSpan = document.querySelector('[data-user-name]');
  if (nameSpan && isSignedIn) {
      nameSpan.textContent = user.user_name || user.email || '';
  }
}

window.updateUserUI = updateUserUI;

function updateBrandUI() {
  // CORRECTED: Using the global 'window' variables and building the full logo URL
  document.querySelectorAll('[data-brand="name"]').forEach(el => el.textContent = window.BRAND_NAME);
  document.querySelectorAll('[data-brand="phone"]').forEach(el => el.textContent = window.PHONE_NUMBER);
  document.querySelectorAll('[data-brand="email"]').forEach(el => el.textContent = window.EMAIL);
  document.querySelectorAll('[data-brand="address"]').forEach(el => el.textContent = window.ADDRESS);
  
  // THIS IS THE KEY FIX
  document.querySelectorAll('[data-brand="logo"]').forEach(el => {
    if (window.BRAND_LOGO_PATH) {
      // Check if it's already a full URL
      if (window.BRAND_LOGO_PATH.startsWith('http')) {
        el.src = window.BRAND_LOGO_PATH;
      } else {
        // Build the full URL from API_HOST and the relative path
        el.src = `${window.API_HOST}/${window.BRAND_LOGO_PATH.replace(/^\/+/, '')}`;
      }
    }
  });

  document.querySelectorAll('[data-brand-link="phone"]').forEach(el => el.href = `tel:${window.PHONE_NUMBER}`);
  document.querySelectorAll('[data-brand-link="email"]').forEach(el => el.href = `mailto:${window.EMAIL}`);
  document.querySelectorAll('[data-brand-link="facebook"]').forEach(el => el.href = window.FACEBOOK_ADDRESS);
  document.querySelectorAll('[data-brand-link="instagram"]').forEach(el => el.href = window.INSTAGRAM_ADDRESS);
  document.querySelectorAll('[data-brand-link="tiktok"]').forEach(el => el.href = window.TIKTOK_ADDRESS);
}
window.updateBrandUI = updateBrandUI;
// =================================================================
// 3. DATA FETCHING & API CALLS
// =================================================================

async function fetchBrandData() {
  try {
    // CORRECTED: Using the global 'window' variable
    const response = await fetch(`${window.API_ROOT}/brand`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data[0] : data;
  } catch (error) {
    console.error("Could not fetch brand data:", error);
    return null;
  }
}
window.fetchBrandData = fetchBrandData;

async function loginWithEmail(email, password) {
  // CORRECTED: Using the global 'window' variable
  const res = await fetch(`${window.API_ROOT}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email,password })
  });
  if (!res.ok) {
    let err = 'Login failed';
    try { err = (await res.json()).error || err; } catch (_) {}
    throw new Error(`${err} (${res.status})`);
  }
  return res.json();
}
window.loginWithEmail = loginWithEmail;

// =================================================================
// 4. INITIALIZATION & EVENT LISTENERS
// =================================================================

async function initializePage() {
  console.log('Initializing page...');
  await checkSession(); // Set initial sign-in/sign-out visibility
  setupOAuthButtons();

  const brandData = await fetchBrandData();
  if (brandData) {
    // CORRECTED: Updating the global 'window' variables
    window.BRAND_NAME = brandData.brand_name || window.BRAND_NAME;
    window.BRAND_LOGO_PATH = brandData.brand_logoPath;
    window.PHONE_NUMBER = brandData.brand_phoneNumber;
    window.EMAIL = brandData.brand_email;
    window.ADDRESS = brandData.brand_address;
    window.FACEBOOK_ADDRESS = brandData.brand_facebookAddress;
    window.INSTAGRAM_ADDRESS = brandData.brand_instagramAddress;
    window.TIKTOK_ADDRESS = brandData.brand_tiktokAddress;
    window.STRIPE_TOKEN = brandData.brand_stripeToken;
    window.BRAND_THEME = resolveThemeHref(brandData.brand_theme);
    applyThemeStylesheet(window.BRAND_THEME);
    updateBrandUI();
    document.title = window.BRAND_NAME;
  }

  const form = document.getElementById('signin-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('signin-email')?.value.trim();
      const password = document.getElementById('signin-password')?.value;
      const msg = document.getElementById('signin-msg');

      try {
        if (msg) { msg.textContent = 'Signing in...'; msg.className = 'gl-text u-s-m-b-15'; }
        const user = await loginWithEmail(email, password);
        setCurrentUser(user);

        // Redirect after successful login
        window.location.href = 'dashboard.html'; // Or wherever you want to send logged-in users

      } catch (err) {
        console.error(err);
        if (msg) { msg.textContent = err.message; msg.className = 'gl-text u-s-m-b-15 u-c-brand'; }
        showToast(err?.message || 'We couldn\'t sign you in. Please try again.', { type: 'error' });
      }
    });
  }
}
window.initializePage = initializePage;

document.addEventListener('user:changed', () => {
    console.log('User state changed, updating UI.');
    updateUserUI();
    setupOAuthButtons();
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePage);
} else {
  initializePage();
}
