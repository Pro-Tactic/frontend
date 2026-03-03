const API_BASE_URL = "http://127.0.0.1:8000";

export function resolveMediaUrl(pathOrUrl) {
  if (!pathOrUrl) return "";

  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  if (pathOrUrl.startsWith("//")) {
    return `http:${pathOrUrl}`;
  }

  const normalizedPath = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${API_BASE_URL}${normalizedPath}`;
}
