"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { FaqForm } from "@/features/admin/components/organisms/faq-form";
import { DEFAULT_FAQ_TYPE, getFaqTypeLabel, isFaqType } from "@/features/admin/config/faq-config";
import { useCreateFaq, useUpdateFaq } from "@/features/admin/hooks/mutations/use-faq-mutations";
import { useFaqDetail } from "@/features/admin/hooks/queries/use-faq-detail";
import { Button } from "@/shared/components/ui/button";
import { ROUTES } from "@/shared/config/routes";
import type { FaqPayload } from "@/shared/types/faq";

export default function AdminFaqFormPage() {
  const router = useRouter();
  const params = useParams<{ faqId?: string }>();
  const searchParams = useSearchParams();
  const faqId = params.faqId;
  const typeParam = searchParams.get("type");
  const defaultType = isFaqType(typeParam) ? typeParam : DEFAULT_FAQ_TYPE;
  const isEditMode = Boolean(faqId);
  const { faq, loading, isError } = useFaqDetail(faqId);
  const createMutation = useCreateFaq();
  const updateMutation = useUpdateFaq();

  const handleSubmit = async (payload: FaqPayload) => {
    if (isEditMode) {
      if (!faqId) return;
      const response = await updateMutation.mutateAsync({ faqId, payload, oldType: faq?.type });
      if ((response?.statusCode && response.statusCode >= 400) || !response?.data) return;
      router.push(`${ROUTES.ADMIN.FAQS}?type=${payload.type}`);
      return;
    }

    const response = await createMutation.mutateAsync(payload);
    if ((response?.statusCode && response.statusCode >= 400) || !response?.data) return;
    router.push(`${ROUTES.ADMIN.FAQS}?type=${payload.type}`);
  };

  if (isEditMode && loading) {
    return (
      <div className="p-6">
        <div className="rounded-lg border bg-background p-6 shadow">Đang tải FAQ...</div>
      </div>
    );
  }

  if (isEditMode && (isError || !faq)) {
    return (
      <div className="p-6">
        <div className="rounded-lg border bg-background p-6 shadow">
          <h5>Không thể tải FAQ</h5>
          <p className="fs-sm text-gray mt-1">FAQ không tồn tại hoặc API đang lỗi.</p>
          <Button asChild className="mt-4">
            <Link href={ROUTES.ADMIN.FAQS}>Quay lại</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 rounded-lg border bg-background p-6 shadow">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h5>{isEditMode ? "Cập nhật FAQ" : "Tạo FAQ"}</h5>
            <p className="fs-sm text-gray">
              {isEditMode
                ? `Chỉnh sửa nội dung ${getFaqTypeLabel(faq?.type ?? defaultType)}`
                : "Tạo FAQ, Tutorial hoặc About Us bằng cùng một biểu mẫu"}
            </p>
          </div>
          <Button asChild type="button" variant="outline" className="shrink-0">
            <Link href={`${ROUTES.ADMIN.FAQS}?type=${faq?.type ?? defaultType}`}>
              <ArrowLeft className="size-4" />
              Quay lại
            </Link>
          </Button>
        </div>

        <FaqForm
          defaultType={faq?.type ?? defaultType}
          faq={faq}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
