const TOKEN_KEY = "accessToken";
const COOKIE_FLAG = "has_token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  document.cookie = `${COOKIE_FLAG}=true; path=/; SameSite=Lax`;
}

export function removeAccessToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = `${COOKIE_FLAG}=; path=/; max-age=0`;
}
