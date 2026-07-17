"use client";

import { Check, Pencil, PlusIcon, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { TrashCanIcon } from "@/shared/components/atoms/icon/icon";
import { ButtonGroup } from "@/shared/components/molecules/button-group";
import { DataTable } from "@/shared/components/molecules/data-table";
import { SearchBar } from "@/shared/components/molecules/search-bar";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import type { TermOfServiceResponse } from "@/shared/types/term-of-service";
import {
  useAddTermOfService,
  useRemoveTermOfService,
  useUpdateTermOfService,
} from "../../hooks/mutations/use-terms-of-service-mutations";
import { useTermsOfService } from "../../hooks/queries/use-terms-of-service";

const buttonItems = ["Tất cả", "Hoạt động", "Đã xóa"];
const headers = ["Tên chính sách", "Trạng thái", "Hành động"];
const NEW_ROW = { __new: true } as const;
type PolicyRow = TermOfServiceResponse | typeof NEW_ROW;

export default function AdminPolicyEditor() {
  const { policies, loading } = useTermsOfService();
  const { mutateAsync: addTermOfService } = useAddTermOfService();
  const { mutate: removeTermOfService } = useRemoveTermOfService();
  const { mutateAsync: updateTermOfService } = useUpdateTermOfService();

  const inputAddPolicy = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState("");
  const [selectedType, setSelectedType] = useState(buttonItems[0]);
  const [addPolicyClicked, setAddPolicyClicked] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const filteredData = useMemo(() => {
    return policies
      .filter((policy) => {
        if (selectedType === buttonItems[1]) return policy.status;
        if (selectedType === buttonItems[2]) return !policy.status;
        return true;
      })
      .filter((policy) => policy.name.toLowerCase().includes(searchValue.trim().toLowerCase()));
  }, [policies, searchValue, selectedType]);

  const handleSelected = (value: number) => {
    setSelectedType(buttonItems[value]);
  };

  const handleAddPolicy = () => {
    setAddPolicyClicked(true);
    queueMicrotask(() => inputAddPolicy.current?.focus());
  };

  const acceptPolicy = async () => {
    const name = inputAddPolicy.current?.value.trim() ?? "";

    if (!name) {
      toast.warning("Không được để trống!");
      inputAddPolicy.current?.focus();
      return;
    }

    await addTermOfService(name);
    setAddPolicyClicked(false);
    if (inputAddPolicy.current) inputAddPolicy.current.value = "";
  };

  const declinePolicy = () => {
    if (inputAddPolicy.current) inputAddPolicy.current.value = "";
    setAddPolicyClicked(false);
  };

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditingValue(name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingValue("");
  };

  const confirmEdit = async () => {
    if (!editingId) return;

    const name = editingValue.trim();
    if (!name) {
      toast.warning("Không được để trống!");
      return;
    }

    await updateTermOfService({ id: editingId, name });
    cancelEdit();
  };

  return (
    <div className="pb-1 bg-background rounded-lg flex-grow border shadow flex flex-col gap-3">
      <div className="px-4 pt-4">
        <h5>Cài đặt chính sách</h5>
        <p className="fs-sm text-gray">Quản lý các chính sách và loại vi phạm của mạng xã hội</p>
      </div>

      <div className="px-4 flex flex-col gap-3 flex-shrink-0 lg:flex-row lg:items-center lg:justify-between">
        <ButtonGroup onClick={handleSelected} items={buttonItems} />
        <div className="flex h-10 gap-3 lg:w-[480px]">
          <SearchBar
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Tìm kiếm chính sách"
          />
          <Button
            type="button"
            className="btn-transparent !w-fit px-3 border !rounded-lg"
            onClick={handleAddPolicy}
          >
            <PlusIcon className="size-5" />
            <span>Thêm</span>
          </Button>
        </div>
      </div>

      <DataTable<PolicyRow>
        loading={loading}
        headers={headers}
        data={addPolicyClicked ? [NEW_ROW, ...filteredData] : filteredData}
        emptyText="Không có chính sách nào"
        bodyClassName=""
        getRowKey={(row, index) => ("__new" in row ? "new-policy" : row.id) ?? index}
        rowClassName={(row) =>
          cn(
            "hover:bg-secondary border-t transition",
            !("__new" in row) && !row.status && "text-muted-foreground bg-muted/30",
          )
        }
        renderRow={(row, index) => {
          if ("__new" in row) {
            return (
              <>
                <td align="center" className="ps-2 pe-4 py-5 fs-xs text-gray">
                  -
                </td>
                <td className="px-2 py-3">
                  <Input
                    ref={inputAddPolicy}
                    className="h-10"
                    placeholder="Điền nội dung vi phạm"
                  />
                </td>
                <td className="px-2 fs-xs text-gray">Chưa lưu</td>
                <td className="px-2">
                  <div className="flex items-center justify-center gap-2">
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
                      <X className="size-5" />
                    </Button>
                  </div>
                </td>
              </>
            );
          }

          const policy = row;
          return (
            <>
              <td align="center" className="ps-2 pe-4 py-5 fs-xs text-gray">
                {addPolicyClicked ? index : index + 1}
              </td>
              <td className="px-2 py-3">
                {editingId === policy.id ? (
                  <Input
                    value={editingValue}
                    onChange={(event) => setEditingValue(event.target.value)}
                    className="h-10"
                    autoFocus
                  />
                ) : (
                  <p className="fs-xs font-medium">{policy.name}</p>
                )}
              </td>
              <td className="px-2">
                <span
                  className={cn(
                    "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                    policy.status
                      ? "bg-primary-ghost text-primary"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {policy.status ? "Hoạt động" : "Đã xóa"}
                </span>
              </td>
              <td align="center" className="px-2">
                {editingId === policy.id ? (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      className="btn-transparent border !size-8"
                      onClick={confirmEdit}
                    >
                      <Check className="size-5" />
                    </Button>
                    <Button
                      type="button"
                      className="btn-transparent border !size-8"
                      onClick={cancelEdit}
                    >
                      <X className="size-5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      className="btn-transparent border !size-8"
                      onClick={() => startEdit(policy.id, policy.name)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      className="btn-transparent border !size-8"
                      disabled={!policy.status}
                      onClick={() => removeTermOfService(policy.id)}
                    >
                      <TrashCanIcon className="size-5" />
                    </Button>
                  </div>
                )}
              </td>
            </>
          );
        }}
      />
    </div>
  );
}
