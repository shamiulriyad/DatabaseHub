const STORAGE_KEY = "elearning.accessToken";

export function getAccessToken() {
  // Support legacy key `token` used by other auth helpers in the app
  return localStorage.getItem(STORAGE_KEY) || localStorage.getItem('token') || null;
}

export function setAccessToken(token) {
  if (!token) return;
  // Store under both keys to be compatible with different parts of the app
  localStorage.setItem(STORAGE_KEY, token);
  localStorage.setItem('token', token);
}

export function clearAccessToken() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem('token');
}
