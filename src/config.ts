const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;

export const apiBaseUrl = rawApiBaseUrl?.trim() ?? '';

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (!apiBaseUrl) {
    return normalizedPath;
  }

  return `${apiBaseUrl.replace(/\/$/, '')}${normalizedPath}`;
}
