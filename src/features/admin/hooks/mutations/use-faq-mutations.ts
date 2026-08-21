"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createFaq, deleteFaq, updateFaq } from "@/services/admin/admin-faq-api";
import { adminKeys } from "@/services/admin/admin.key";
import type { ApiResponse } from "@/shared/types/api-response";
import type { FaqPayload, FaqResponse, FaqType } from "@/shared/types/faq";

function isApiError(response: ApiResponse<unknown> | null) {
  return !response || Boolean(response.statusCode && response.statusCode >= 400);
}

export function useCreateFaq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFaq,
    onSuccess: (response, payload) => {
      if (isApiError(response) || !response?.data) {
        toast.error(response?.message ?? "Tạo FAQ thất bại");
        return;
      }

      toast.success(response.message ?? "Tạo FAQ thành công");
      queryClient.invalidateQueries({ queryKey: adminKeys.faqs.byType(payload.type) });
    },
    onError: () => {
      toast.error("Tạo FAQ thất bại");
    },
  });
}

export function useUpdateFaq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ faqId, payload }: { faqId: string; payload: FaqPayload; oldType?: FaqType }) =>
      updateFaq(faqId, payload),
    onSuccess: (response, { faqId, payload, oldType }) => {
      if (isApiError(response) || !response?.data) {
        toast.error(response?.message ?? "Cập nhật FAQ thất bại");
        return;
      }

      toast.success(response.message ?? "Cập nhật FAQ thành công");
      queryClient.invalidateQueries({ queryKey: adminKeys.faqs.detail(faqId) });
      queryClient.invalidateQueries({ queryKey: adminKeys.faqs.byType(payload.type) });
      if (oldType && oldType !== payload.type) {
        queryClient.invalidateQueries({ queryKey: adminKeys.faqs.byType(oldType) });
      }
      queryClient.invalidateQueries({ queryKey: adminKeys.faqs.all });
    },
    onError: () => {
      toast.error("Cập nhật FAQ thất bại");
    },
  });
}

export function useDeleteFaq(type: FaqType) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFaq,
    onSuccess: (response, faqId) => {
      if (isApiError(response)) {
        toast.error(response?.message ?? "Xóa FAQ thất bại");
        return;
      }

      toast.success(response?.message ?? "Xóa FAQ thành công");
      queryClient.setQueryData<ApiResponse<FaqResponse[]> | null>(adminKeys.faqs.byType(type), (resp) => {
        if (!resp?.data) return resp;
        return {
          ...resp,
          data: resp.data.filter((faq) => faq.id !== faqId),
        };
      });
      queryClient.invalidateQueries({ queryKey: adminKeys.faqs.byType(type) });
    },
    onError: () => {
      toast.error("Xóa FAQ thất bại");
    },
  });
}
