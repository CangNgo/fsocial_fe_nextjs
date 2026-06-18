import { jwtDecode } from "jwt-decode";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

interface JwtPayload {
  sub: string;
  scope: string;
  exp: number;
}

const GUEST_ONLY_PATHS = ["/login", "/signup", "/forgot-password"];
const ADMIN_PREFIX = "/admin";
const USER_PATHS = ["/home", "/follow", "/search", "/message", "/profile", "/post", "/setting"];

function getRoleFromToken(token: string | undefined): string | null {
  if (!token) return null;
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (decoded.exp * 1000 < Date.now()) return null;
    return decoded.scope;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const refreshToken = request.cookies.get("refresh-token")?.value;
  const accessToken = request.cookies.get("access-token")?.value;
  const role = getRoleFromToken(accessToken);

  const isLoggedIn = !!refreshToken;
  const isAdmin = role === "ADMIN";
  const isGuestPath = GUEST_ONLY_PATHS.some((p) => pathname.startsWith(p));
  const isAdminPath = pathname.startsWith(ADMIN_PREFIX);
  const isUserPath = USER_PATHS.some((p) => pathname.startsWith(p));

  if (!isLoggedIn && (isUserPath || isAdminPath)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (isLoggedIn && isGuestPath) {
    const redirectTo = isAdmin ? "/admin/complaint" : "/home";
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  if (isLoggedIn && isAdminPath && !isAdmin) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  if (isLoggedIn && isUserPath && isAdmin) {
    return NextResponse.redirect(new URL("/admin/complaint", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|images|oauth2).*)"],
};
