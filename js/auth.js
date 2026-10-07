/**
 * ====================================================================
 * MODULE: auth.js
 * Student Attendance Management System - Authentication Controller
 * ====================================================================
 * Academic STQA Project - Pure Vanilla JavaScript
 * Demonstrates:
 *  - Form Validation (Empty checks, string sanitization)
 *  - Deterministic Credential Verification
 *  - Session State Persistence using localStorage
 *  - Route Protection and Redirection
 */

const AUTH_CONFIG = {
  VALID_USERNAME: 'admin',
  VALID_PASSWORD: 'admin123',
  STORAGE_KEY: 'sams_current_user'
};

/**
 * Validates login credentials against predefined system rules.
 * @param {string} username - User input username
 * @param {string} password - User input password
 * @returns {Object} result - { success: boolean, message: string }
 */
function validateLogin(username, password) {
  const cleanUser = (username || '').trim();
  const cleanPass = (password || '').trim();

  // Rule 1: Empty field validation
  if (!cleanUser && !cleanPass) {
    return { success: false, message: 'Please enter both username and password.' };
  }
  if (!cleanUser) {
    return { success: false, message: 'Username cannot be empty.' };
  }
  if (!cleanPass) {
    return { success: false, message: 'Password cannot be empty.' };
  }

  // Rule 2: Credential check
  if (cleanUser === AUTH_CONFIG.VALID_USERNAME && cleanPass === AUTH_CONFIG.VALID_PASSWORD) {
    const sessionData = {
      username: cleanUser,
      role: 'Teacher',
      loginTime: new Date().toISOString()
    };
    localStorage.setItem(AUTH_CONFIG.STORAGE_KEY, JSON.stringify(sessionData));
    return { success: true, message: 'Login successful. Redirecting...' };
  }

  return { success: false, message: 'Invalid username or password. Please try again.' };
}

/**
 * Retrieves the currently logged in user session object.
 * @returns {Object|null}
 */
function getCurrentUser() {
  try {
    const data = localStorage.getItem(AUTH_CONFIG.STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Error reading auth session:', e);
    return null;
  }
}

/**
 * Terminates user session and redirects to login portal.
 */
function logout() {
  localStorage.removeItem(AUTH_CONFIG.STORAGE_KEY);
  window.location.href = 'index.html';
}

/**
 * Enforces route authorization.
 * @param {boolean} requiresAuth - Whether the current page requires an active session
 */
function initAuthProtection(requiresAuth = true) {
  const user = getCurrentUser();

  if (requiresAuth && !user) {
    // Protected page accessed without session -> Redirect to login
    window.location.href = 'index.html';
    return;
  }

  if (!requiresAuth && user) {
    // Login page accessed with active session -> Redirect to dashboard
    window.location.href = 'dashboard.html';
    return;
  }

  // Populate user badge in UI if navbar exists
  const userBadge = document.getElementById('navUserBadge');
  if (userBadge && user) {
    userBadge.textContent = `${user.username} (${user.role})`;
  }
}

// Export for Node/unit test environments if available
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AUTH_CONFIG,
    validateLogin,
    getCurrentUser,
    logout
  };
}
