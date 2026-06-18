"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/atoms/button";
import { LoadingIcon } from "@/components/atoms/Icon";
import { RadioGroup, RadioGroupItem } from "@/components/atoms/radio-group";
import { getTermOfService } from "@/lib/api/admin/adminPolicySettingApi";
import { complaint } from "@/lib/api/posts/complaintApi";
import { ownerAccountStore } from "@/store/ownerAccountStore";
import { usePopupStore } from "@/store/popupStore";

interface TermOption {
  id: string;
  name: string;
}

export function ReportModal({ id }: { id: string }) {
  const { hidePopup } = usePopupStore();
  const user = ownerAccountStore.getState().user;
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [reportOptions, setReportOptions] = useState<TermOption[]>([]);
  const [submitClicked, setSubmitClicked] = useState(false);

  useEffect(() => {
    getTermOfService().then((resp: unknown) => {
      const r = resp as { data?: TermOption[] };
      if (r?.data) setReportOptions(r.data);
    });
  }, []);

  const submitReport = async () => {
    setSubmitClicked(true);
    await complaint({
      postId: id,
      userId: user?.userId,
      complaintType: "Bài viết",
      termOfServiceId: selectedReason,
    });
    setTimeout(() => {
      toast.success("Đã gửi báo cáo");
      hidePopup();
    }, 1000);
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
          className={`btn-primary py-2.5 w-full ${submitClicked ? "opacity-50" : ""}`}
          onClick={submitReport}
        >
          {submitClicked ? <LoadingIcon /> : "Gửi báo cáo"}
        </Button>
      </div>
    </div>
  );
}
