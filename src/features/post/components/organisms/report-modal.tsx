"use client";

import { useState } from "react";
import { toast } from "sonner";
import { LoadingIcon } from "@/shared/components/atoms/icon/icon";
import { Button } from "@/shared/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import { usePopupStore } from "@/shared/stores/popup-store";
import { useCreateReport } from "../../hooks/mutations/use-report-mutations";
import { useReportReasons } from "../../hooks/queries/use-report-reasons";

export function ReportModal({ id }: { id: string }) {
  const { hidePopup } = usePopupStore();
  const user = ownerAccountStore.getState().user;
  const { reportOptions } = useReportReasons();
  const { mutate: createReport, isPending } = useCreateReport();
  const [selectedReason, setSelectedReason] = useState<string>("");

  const submitReport = () => {
    createReport(
      {
        postId: id,
        userId: user.id,
        complaintType: "Bài viết",
        termOfServiceId: selectedReason,
      },
      {
        onSuccess: () => {
          toast.success("Đã gửi báo cáo");
          hidePopup();
        },
      },
    );
  };

  return (
    <div className="relative pt-11 flex flex-col sm:w-[550px] sm:min-h-[50dvh] sm:h-fit sm:max-h-[90dvh] w-screen h-[100dvh]">
      <RadioGroup
        value={selectedReason}
        onValueChange={setSelectedReason}
        className="px-4 flex-grow space-y-3 pt-3 overflow-y-auto"
      >
        {reportOptions.map((option) => (
          <label
            key={option.id}
            htmlFor={option.id}
            className="flex items-center space-x-2 p-3 border rounded hover:bg-accent cursor-pointer transition"
          >
            <RadioGroupItem id={option.id} value={option.id} />
            <span>{option.name}</span>
          </label>
        ))}
      </RadioGroup>
      <div className="sticky bottom-0 p-3 bg-background">
        <Button
          type="button"
          variant="ghost"
          className={`btn-primary py-2.5 w-full ${isPending ? "opacity-50" : ""}`}
          onClick={submitReport}
        >
          {isPending ? <LoadingIcon /> : "Gửi báo cáo"}
        </Button>
      </div>
    </div>
  );
}
