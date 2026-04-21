// ── Clerk Auth Utilities for Prashiksha ──────────────
const CLERK_PK = 'pk_test_Y2xvc2Utc25hcHBlci01LmNsZXJrLmFjY291bnRzLmRldiQ';
// Derive Frontend API URL from publishable key
const CLERK_FRONTEND_API = 'https://' + atob(CLERK_PK.split('_')[2]).slice(0, -1);

// Clerk script tags (must be added to each page's <head> or bottom of <body>)
// <script defer crossorigin="anonymous" src="${CLERK_FRONTEND_API}/npm/@clerk/ui@1/dist/ui.browser.js" type="text/javascript"></script>
// <script defer crossorigin="anonymous" data-clerk-publishable-key="${CLERK_PK}" src="${CLERK_FRONTEND_API}/npm/@clerk/clerk-js@6/dist/clerk.browser.js" type="text/javascript"></script>

// Initialize Clerk (call after load event)
async function initClerk() {
  await window.Clerk.load({
    ui: { ClerkUI: window.__internal_ClerkUICtor },
  });
  return window.Clerk;
}

// Get auth token for API calls
async function getAuthToken() {
  if (!window.Clerk?.session) return null;
  return await window.Clerk.session.getToken();
}

// Authenticated API fetch wrapper
async function apiFetch(url, options = {}) {
  const token = await getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'API request failed');
  }
  return res.json();
}

// Guard: require login, redirect if not authenticated
async function requireAuth(redirectTo = 'student_login.html') {
  await initClerk();
  if (!window.Clerk.user) {
    window.location.href = redirectTo;
    return null;
  }
  return window.Clerk;
}

// Guard: require admin role
async function requireAdmin() {
  const clerk = await requireAuth('admin_login.html');
  if (!clerk) return null;
  const role = clerk.user.publicMetadata?.role;
  if (role !== 'admin') {
    window.location.href = 'student_dashboard.html';
    return null;
  }
  return clerk;
}

// Update user avatar/initials in page
function updateUserUI(clerk) {
  const user = clerk.user;
  if (!user) return;
  
  const avatars = document.querySelectorAll('.user-avatar');
  avatars.forEach(el => {
    const initials = (user.firstName?.[0] || '') + (user.lastName?.[0] || '');
    el.textContent = initials || 'U';
  });

  const nameEls = document.querySelectorAll('.user-name');
  nameEls.forEach(el => {
    el.textContent = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
  });
}

// Logout handler
async function handleLogout(redirectTo = 'student_login.html') {
  if (window.Clerk) {
    await window.Clerk.signOut();
  }
  window.location.href = redirectTo;
}
