const COOKIE_STORE_UNSUPPORTED_MESSAGE = "Cookie Store API is not supported in this environment";

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  const cookieValue = match?.[2];
  return cookieValue ? decodeURIComponent(cookieValue) : null;
}

export async function setCookie(name: string, value: string, days: number): Promise<void> {
  const expires = Date.now() + days * 864e5;
  if (!window.cookieStore) {
    throw new Error(COOKIE_STORE_UNSUPPORTED_MESSAGE);
  }
  await window.cookieStore.set({
    name,
    value,
    expires,
    path: "/",
    sameSite: "lax",
  });
}

export async function deleteCookie(name: string): Promise<void> {
  if (!window.cookieStore) {
    throw new Error(COOKIE_STORE_UNSUPPORTED_MESSAGE);
  }
  await window.cookieStore.delete({ name, path: "/" });
}
