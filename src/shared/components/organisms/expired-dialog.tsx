"use client";
import Link from "next/link";
import { useEffect } from "react";
import { Image } from "@/shared/components/atoms/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { ROUTES } from "@/shared/config/routes";
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
        <Image
          src="/decor/expired_login_decor.svg"
          alt=""
          width={0}
          height={0}
          sizes="400px"
          className="w-full h-auto"
        />
        <Link
          className="btn-primary py-2.5 block text-center mt-4"
          href={ROUTES.LOGIN}
          onClick={() => setRefreshToken(null)}
        >
          Xác nhận
        </Link>
      </DialogContent>
    </Dialog>
  );
}
