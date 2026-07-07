"use client";

import { useGoogleSignInButton } from "../../hooks/use-google-auth";

/** Nút "Sign in with Google" do GSI render, tự load script và gắn callback login. */
export default function GoogleSignInButton() {
  const buttonRef = useGoogleSignInButton();

  return <div ref={buttonRef} className="w-full min-h-11" />;
}
