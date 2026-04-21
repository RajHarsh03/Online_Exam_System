// ── JWT Auth Utilities for Prashiksha ──────────────
const TOKEN_KEY = 'prashiksha_token';
const USER_KEY = 'prashiksha_user';
const SIDEBAR_KEY = 'prashiksha_sidebar_collapsed';

// Store auth data
function saveAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// Get stored token
function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// Get stored user
function getUser() {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
}

// Clear auth data
function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// Check if logged in
function isLoggedIn() {
  return !!getToken();
}

// Authenticated API fetch wrapper
async function apiFetch(url, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    const user = getUser();
    clearAuth();
    // Redirect to the correct login page based on role
    window.location.href = user?.role === 'admin' ? 'admin_login.html' : 'student_login.html';
    return;
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'API request failed');
  }
  return res.json();
}

// Guard: require login
function requireAuth(redirectTo = 'student_login.html') {
  if (!isLoggedIn()) {
    window.location.href = redirectTo;
    return null;
  }
  return getUser();
}

// Guard: require admin role
function requireAdmin() {
  const user = requireAuth('admin_login.html');
  if (!user) return null;
  if (user.role !== 'admin') {
    window.location.href = 'admin_login.html';
    return null;
  }
  return user;
}

// Update user avatar/initials in page
function updateUserUI(user) {
  if (!user) return;
  const avatars = document.querySelectorAll('.user-avatar');
  avatars.forEach(el => {
    const initials = (user.name || '').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    el.textContent = initials || 'U';
  });
  const nameEls = document.querySelectorAll('.user-name');
  nameEls.forEach(el => {
    el.textContent = user.name || 'User';
  });
}

// Logout handler
function handleLogout(redirectTo = 'student_login.html') {
  clearAuth();
  window.location.href = redirectTo;
}

// ── Sidebar collapse persistence ──────────────
function initSidebar() {
  const layout = document.querySelector('.admin-layout');
  if (!layout) return;

  // Restore collapsed state
  if (localStorage.getItem(SIDEBAR_KEY) === 'true') {
    layout.classList.add('collapsed');
  }
}

function toggleAdminSidebar() {
  const layout = document.querySelector('.admin-layout');
  if (!layout) return;

  if (window.innerWidth <= 1024) {
    layout.classList.toggle('mobile-nav-open');
    document.body.classList.toggle('admin-nav-open', layout.classList.contains('mobile-nav-open'));
    return;
  }
  layout.classList.toggle('collapsed');
  // Persist state
  localStorage.setItem(SIDEBAR_KEY, layout.classList.contains('collapsed'));
}

function closeAdminSidebar() {
  const layout = document.querySelector('.admin-layout');
  if (!layout) return;
  layout.classList.remove('mobile-nav-open');
  document.body.classList.remove('admin-nav-open');
}

// Auto-init sidebar on load
initSidebar();
