"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import type { FaqResponse, FaqType } from "@/shared/types/faq";
import { useDeleteFaq } from "../../hooks/mutations/use-faq-mutations";

interface FaqDeleteDialogProps {
  faq: FaqResponse;
  type: FaqType;
}

export function FaqDeleteDialog({ faq, type }: FaqDeleteDialogProps) {
  const { mutate: deleteFaq, isPending } = useDeleteFaq(type);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" className="btn-transparent border !size-8" title="Xóa FAQ">
          <Trash2 className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="text-destructive">
            <Trash2 />
          </AlertDialogMedia>
          <AlertDialogTitle>Xóa FAQ?</AlertDialogTitle>
          <AlertDialogDescription>
            Nội dung <span className="font-medium text-foreground">{faq.name}</span> sẽ bị xóa cùng
            dữ liệu lượt xem và đánh giá liên quan. Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault();
              deleteFaq(faq.id);
            }}
          >
            Xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
