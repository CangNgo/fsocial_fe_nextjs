"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminKeys } from "@/services/admin/admin.key";
import {
  addTermOfService,
  removeTermOfService,
  updateTermOfService,
} from "@/services/admin/admin-policy-setting-api";

export function useAddTermOfService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => addTermOfService(name),
    onSuccess: (res) => {
      if (res?.statusCode !== 200) {
        toast.error("Thêm chính sách thất bại");
        return;
      }
      toast.success("Thêm chính sách thành công");
      queryClient.invalidateQueries({ queryKey: adminKeys.termsOfService });
    },
  });
}

export function useRemoveTermOfService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeTermOfService(id),
    onSuccess: (res) => {
      if (res?.statusCode !== 200) {
        toast.error("Xóa chính sách thất bại");
        return;
      }
      toast.success("Xóa chính sách thành công");
      queryClient.invalidateQueries({ queryKey: adminKeys.termsOfService });
    },
  });
}

export function useUpdateTermOfService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateTermOfService(id, name),
    onSuccess: (res) => {
      if (res?.statusCode !== 200) {
        toast.error("Cập nhật chính sách thất bại");
        return;
      }
      toast.success("Cập nhật chính sách thành công");
      queryClient.invalidateQueries({ queryKey: adminKeys.termsOfService });
    },
  });
}
