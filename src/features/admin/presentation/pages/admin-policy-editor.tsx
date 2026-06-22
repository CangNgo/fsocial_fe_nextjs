// @ts-nocheck
"use client";

import { Check, PlusIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  addTermOfService,
  getTermOfService,
  removeTermOfService,
} from "@/shared/api/admin/admin-policy-setting-api";
import { Button } from "@/shared/components/atoms/button";
import { TrashCanIcon } from "@/shared/components/atoms/icon/icon";
import { Input } from "@/shared/components/atoms/input";

interface Policy {
  id: string;
  name: string;
}

export default function AdminPolicyEditor() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const inputAddPolicy = useRef<HTMLInputElement>(null);
  const [addPolicyClicked, setAddPolicyClicked] = useState(false);

  useEffect(() => {
    const fetchPolicy = async () => {
      const res = await getTermOfService();
      if (!res || res.statusCode !== 200) return;
      setPolicies(res.data);
    };
    fetchPolicy();
  }, []);

  const handleAddPolicy = () => {
    setAddPolicyClicked(true);
    setTimeout(() => {
      inputAddPolicy.current?.focus();
    }, 1);
  };

  const acceptPolicy = async () => {
    if (!inputAddPolicy.current || inputAddPolicy.current.value.trim() === "") {
      toast.warning("Không được để trống!");
      setTimeout(() => {
        inputAddPolicy.current?.focus();
      }, 1);
      return;
    }

    const res = await addTermOfService(inputAddPolicy.current.value);
    if (!res || res.statusCode !== 200) {
      toast.error("Thêm chính sách thất bại");
      return;
    }
    toast.success("Thêm chính sách thành công");
    const data = res.data as Policy;
    setPolicies((prev) => [{ id: data.id, name: data.name }, ...prev]);
    setAddPolicyClicked(false);
    inputAddPolicy.current.value = "";
  };

  const declinePolicy = () => {
    if (inputAddPolicy.current) {
      inputAddPolicy.current.value = "";
    }
    setAddPolicyClicked(false);
  };

  const handleRemovePolicy = async (id: string) => {
    const res = await removeTermOfService(id);
    if (!res || res.statusCode !== 200) {
      toast.error("Xóa chính sách thất bại");
      return;
    }
    toast.success("Xóa chính sách thành công");
    setPolicies((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="flex-grow h-full grid grid-cols-2 bg-background rounded-lg border shadow">
      <div className="p-8 h-full flex flex-col min-h-0">
        <div className="px-1 space-y-4">
          <div>
            <h5>Cập nhật chính sách</h5>
            <p className="fs-sm text-gray">
              Cập nhật các chính sách, loại vi phạm mới cho mạng xã hội
            </p>
          </div>

          <Button
            type="button"
            className="z-10 btn-transparent !bg-background sticky top-0 border p-4 !justify-start w-full flex items-center gap-2"
            onClick={handleAddPolicy}
          >
            <PlusIcon /> Thêm
          </Button>
        </div>

        <div className="space-y-2 relative flex-grow overflow-y-auto px-1">
          <div className={`mt-1 relative ${!addPolicyClicked && "hidden"}`}>
            <Input
              ref={inputAddPolicy}
              className="bg-transparent p-5 border w-full rounded"
              placeholder="Điền nội dung vi phạm"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
              <Button
                type="button"
                className="btn-transparent border !size-8"
                onClick={acceptPolicy}
              >
                <Check className="size-5" />
              </Button>
              <Button
                type="button"
                className="btn-transparent border !size-8"
                onClick={declinePolicy}
              >
                <span className="sr-only">Hủy</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            </div>
          </div>

          {policies.map((policy, index) => (
            <div
              className="flex items-center justify-between w-full bg-background p-5 rounded border"
              key={policy.id ?? index}
            >
              <span>{policy.name}</span>
              <Button type="button" onClick={() => handleRemovePolicy(policy.id)}>
                <TrashCanIcon />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="w-full mt-auto" src="/decor/rocket-launching.svg" alt="Rocket Illustration" />
    </div>
  );
}
