const TOKEN_KEY = "token";
const USER_TYPE_KEY = "user_type";
const REFRESH_TOKEN_KEY = "refresh_token";

function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const json = atob(padded);

    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function isTokenExpired(token) {
  if (!token) return true;

  const payload = decodeToken(token);
  if (!payload?.exp) return true;

  const nowInSeconds = Math.floor(Date.now() / 1000);
  return payload.exp <= nowInSeconds;
}

export function isAuthenticated() {
  const token = getAccessToken();
  return !!token && !isTokenExpired(token);
}

export function saveSession({ access, refresh, user_type }) {
  if (access) localStorage.setItem(TOKEN_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  if (user_type) localStorage.setItem(USER_TYPE_KEY, user_type);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_TYPE_KEY);
}
