// ====== Auth + User State (frontend-only) ======
// All shared variables are explicitly attached to the global 'window' object.
window.CUSTOMER_ID = window.CUSTOMER_ID || 'products_test_user';
window.customerId = window.CUSTOMER_ID; // Alias for admin.js compatibility
window.API_HOST = 'http://18.189.17.62';
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

// =================================================================
// 1. CORE USER FUNCTIONS
// =================================================================

function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('currentUser') || 'null'); } catch (_) { return null; }
}
window.getCurrentUser = getCurrentUser;

function setCurrentUser(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
  document.dispatchEvent(new CustomEvent('user:changed', { detail: user }));
}
window.setCurrentUser = setCurrentUser;

function clearCurrentUser() {
  localStorage.removeItem('currentUser');
  document.dispatchEvent(new CustomEvent('user:changed', { detail: null }));
}
window.clearCurrentUser = clearCurrentUser;

// =================================================================
// 2. UI UPDATE FUNCTIONS (USER & BRAND)
// =================================================================

function updateUserUI() {
  const user = getCurrentUser();
  const isAdmin = user && user.user_isAdmin === 1;

  document.querySelectorAll('[data-show-when="signed-in"]').forEach(el => { 
    el.style.display = user ? '' : 'none'; 
  });
  document.querySelectorAll('[data-show-when="guest"]').forEach(el => { 
    el.style.display = user ? 'none' : ''; 
  });
  document.querySelectorAll('[data-show-when="admin"]').forEach(el => { 
    el.style.display = isAdmin ? '' : 'none'; 
  });

  const nameSpan = document.querySelector('[data-user-name]');
  if (nameSpan) nameSpan.textContent = user?.user_name || user?.user_email || '';
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
    body: JSON.stringify({ username: email, password })
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
  updateUserUI(); // Set initial sign-in/sign-out visibility

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
        if (msg) msg.textContent = `Welcome, ${user.user_name || user.user_email}!`;
        alert(`Welcome, ${user.user_name || user.user_email}!`);
        console.log('[auth] currentUser =>', user);
      } catch (err) {
        console.error(err);
        if (msg) { msg.textContent = err.message; msg.className = 'gl-text u-s-m-b-15 u-c-brand'; }
        alert(err.message);
      }
    });
  }
}
window.initializePage = initializePage;

document.addEventListener('user:changed', () => {
    console.log('User state changed, updating UI.');
    updateUserUI();
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePage);
} else {
  initializePage();
}