"use client";

import { LoadingIcon } from "@/shared/components/atoms/icon/icon";
import { Button } from "@/shared/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { useCreateReport } from "@/shared/hooks/use-report-mutations";
import { useReportReasons } from "@/shared/hooks/use-report-reasons";
import { usePopupStore } from "@/shared/stores/popup-store";
import Image from "next/image";
import { useState } from "react";
import { Virtuoso } from "react-virtuoso";
import { toast } from "sonner";

export function ReportModal({
  targetId,
  complaintType = "POST",
}: {
  targetId: string;
  complaintType?: "POST" | "STORY" | "LIVESTREAM" | "ACCOUNT";
}) {
  const { hidePopup } = usePopupStore();
  const { reportOptions } = useReportReasons();
  const { mutate: createReport, isPending } = useCreateReport();
  const [selectedReason, setSelectedReason] = useState<string>("");

  const submitReport = () => {
    if (!selectedReason) {
      toast.error("Vui lòng chọn lý do báo cáo");
      return;
    }

    createReport(
      {
        targetId,
        complaintType,
        termOfServiceId: selectedReason,
      },
      {
        onSuccess: (res) => {
          if (res?.statusCode !== 200) {
            toast.error(res?.message ?? "Gửi báo cáo thất bại");
            return;
          }

          toast.success("Đã gửi báo cáo");
          hidePopup();
        },
      },
    );
  };

  return (
    <div className="relative flex h-[100dvh] w-screen flex-col pt-11 sm:h-fit sm:min-h-[80dvh] sm:max-h-[90dvh] sm:w-[900px]">
      <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
        <div className="hidden sm:flex sm:w-[42%] sm:flex-col sm:justify-center sm:border-r sm:bg-muted/20 sm:p-6">
          <Image
            src="/complant.png"
            alt="Minh họa hệ thống tiếp nhận thông tin báo cáo"
            width={700}
            height={700}
            className="h-auto w-full object-contain"
            priority
          />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Chúng tôi đã tiếp nhận thông tin bạn cung cấp và sẽ xem xét nội dung này.
          </p>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <RadioGroup
            value={selectedReason}
            onValueChange={setSelectedReason}
            className="flex-grow px-4"
          >
            <Virtuoso
              className="h-full"
              data={reportOptions}
              itemContent={(_, option) => (
                <label
                  htmlFor={option.id}
                  className="mb-2 flex cursor-pointer items-center space-x-2 rounded-2xl border p-3 transition hover:bg-accent"
                >
                  <RadioGroupItem id={option.id} value={option.id} />
                  <span>{option.name}</span>
                </label>
              )}
            />
          </RadioGroup>
          <div className="sticky bottom-0 bg-background p-3">
            <Button
              type="button"
              variant="ghost"
              className={`btn-primary w-full py-2.5 ${isPending ? "opacity-50" : ""}`}
              onClick={submitReport}
            >
              {isPending ? <LoadingIcon /> : "Gửi báo cáo"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
