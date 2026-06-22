"use client";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Button } from "@/shared/components/atoms/button";
import {
  Dialog,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/shared/components/atoms/dialog";
import { XMarkIcon } from "@/shared/components/atoms/icon/icon";
import { cn } from "@/shared/lib/utils";
import { usePopupStore } from "@/shared/stores/popup-store";
import { useThemeStore } from "@/shared/stores/theme-store";

export function GlobalPopup() {
  const { heading, isOpen, children, hidePopup } = usePopupStore();
  const { theme } = useThemeStore();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && hidePopup()}>
      <DialogPortal data-slot="dialog-portal">
        <DialogOverlay className="bg-black/35" />
        <DialogPrimitive.Content
          data-slot="dialog-content"
          className={cn(
            "fixed z-50 bg-background rounded-lg overflow-hidden outline-none",
            "inset-x-0 bottom-0 max-h-[90dvh] data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom",
            "sm:inset-x-auto sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-h-screen sm:py-2 sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=closed]:zoom-out-95 sm:data-[state=closed]:fade-out-0 sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=open]:zoom-in-95 sm:data-[state=open]:fade-in-0",
            theme === "dark" && "border",
          )}
        >
          {!heading && <DialogTitle className="sr-only">Popup</DialogTitle>}
          <DialogDescription className="sr-only pt-0">{heading}</DialogDescription>
          <div
            className={cn(
              "absolute z-20 bg-background w-full",
              heading ? "border-b py-2" : "flex justify-end",
            )}
          >
            {heading && (
              <DialogTitle asChild>
                <h5 className="text-center">{heading}</h5>
              </DialogTitle>
            )}
            <Button
              type="button"
              className={cn(
                heading ? "absolute top-0 right-0 bottom-0 h-full rounded-md me-2" : "px-3 pt-3",
              )}
              onClick={hidePopup}
            >
              <XMarkIcon className="size-5" />
            </Button>
          </div>
          {children}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
