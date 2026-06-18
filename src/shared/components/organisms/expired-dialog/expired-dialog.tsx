"use client";
import Link from "next/link";
import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/atoms/dialog";
import { validRefreshTokenStore } from "@/shared/stores/valid-refresh-token-store";

interface ExpiredDialogProps {
  open: boolean;
}

export function ExpiredDialog({ open }: ExpiredDialogProps) {
  const setRefreshToken = validRefreshTokenStore((state) => state.setRefreshToken);

  useEffect(() => {
    const handleExpired = () => setRefreshToken(null);
    window.addEventListener("auth:expired", handleExpired);
    return () => window.removeEventListener("auth:expired", handleExpired);
  }, [setRefreshToken]);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:w-[400px] w-screen p-3"
        showCloseButton={false}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-center">Phiên đăng nhập đã hết hạn</DialogTitle>
        </DialogHeader>
        <img src="/decor/expired_login_decor.svg" alt="" />
        <Link
          className="btn-primary py-2.5 block text-center mt-4"
          href="/login"
          onClick={() => setRefreshToken(null)}
        >
          Xác nhận
        </Link>
      </DialogContent>
    </Dialog>
  );
}
