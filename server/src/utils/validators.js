// Lightweight, dependency-free input validators. Each returns an error string
// describing the first problem, or null when the value is valid.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email) {
  if (typeof email !== 'string' || email.trim().length === 0) return 'Email is required';
  const value = email.trim();
  if (value.length > 254 || !EMAIL_RE.test(value)) return 'A valid email address is required';
  return null;
}

function validateUsername(username) {
  if (typeof username !== 'string' || username.trim().length === 0) return 'Username is required';
  const value = username.trim();
  if (value.length < 3 || value.length > 30) return 'Username must be 3–30 characters';
  if (!/^[a-zA-Z0-9_.-]+$/.test(value)) return 'Username may only contain letters, numbers, and . _ -';
  return null;
}

function validatePassword(password) {
  if (typeof password !== 'string' || password.length === 0) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (password.length > 128) return 'Password must be at most 128 characters';
  if (!/[a-zA-Z]/.test(password)) return 'Password must contain at least one letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  return null;
}

module.exports = { validateEmail, validateUsername, validatePassword };
