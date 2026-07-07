"use client";

import { useGoogleAuth } from "../../hooks/use-google-auth";

/**
 * Mount một lần trong (auth) layout để hiện Google One Tap ở góc phải màn hình
 * cho khách chưa đăng nhập, đồng thời render nút "Sign in with Google"
 * trên trang nào có element #google-signin-btn.
 */
export default function GoogleOneTap() {
  useGoogleAuth();
  return null;
}
