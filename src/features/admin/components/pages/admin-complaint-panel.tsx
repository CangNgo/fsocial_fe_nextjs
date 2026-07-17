"use client";

import { Pen } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarIcon, TrashCanIcon } from "@/shared/components/atoms/icon/icon";
import { ButtonGroup } from "@/shared/components/molecules/button-group";
import { DataTable } from "@/shared/components/molecules/data-table";
import { SearchBar } from "@/shared/components/molecules/search-bar";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { useReadComplaint } from "../../hooks/mutations/use-complaint-mutations";
import { useComplaints } from "../../hooks/queries/use-complaints";

const buttonItems = ["Tất cả", "Bài viết", "Người dùng"];

const headers = [
  "Người báo cáo",
  "Loại báo cáo",
  "Người dùng/Bài viết bị báo cáo",
  "Nội dung báo cáo",
  "Số lượt báo cáo",
  "Ngày báo cáo",
  "Hành động",
];

export default function AdminComplaintPanel() {
  const { complaints, loading } = useComplaints();
  const { mutate: mutateReadComplaint } = useReadComplaint();

  const [searchValue, setSearchValue] = useState("");
  const [selectedType, setSelectedType] = useState("Tất cả");
  const [removedIds, setRemovedIds] = useState<string[]>([]);

  const filteredData = useMemo(() => {
    return complaints
      .filter((item) => !removedIds.includes(item.id))
      .filter((item) =>
        selectedType.toLowerCase() === "tất cả"
          ? true
          : item.complaintType.toLowerCase() === selectedType.toLowerCase(),
      )
      .filter((item) =>
        Object.values(item).some((val) =>
          val?.toString().toLowerCase().includes(searchValue.toLowerCase()),
        ),
      );
  }, [complaints, removedIds, selectedType, searchValue]);

  const handleSelected = (value: number) => {
    setSelectedType(buttonItems[value]);
  };

  const handleReadComplaint = (id: string) => {
    mutateReadComplaint(id);
  };

  const handleRemoveComplaint = (id: string) => {
    setRemovedIds((prev) => [...prev, id]);
  };

  return (
    <div className="pb-1 bg-background rounded-lg flex-grow border shadow flex flex-col gap-3">
      <div className="px-4 pt-4">
        <h5>Lịch sử báo báo</h5>
        <p className="fs-sm text-gray">Quản lý báo cáo vi phạm người dùng, bài viết</p>
      </div>

      <div className="px-4 flex justify-between flex-shrink-0 h-[40px]">
        <ButtonGroup onClick={handleSelected} items={buttonItems} />
        <div className="flex justify-between w-[400px] gap-3">
          <SearchBar
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Tìm kiếm"
          />
          <Button type="button" className="btn-transparent !w-fit px-2 border !rounded-lg">
            <CalendarIcon />
          </Button>
        </div>
      </div>

      <DataTable
        loading={loading}
        headers={headers}
        data={filteredData}
        emptyText="Không có khiếu nại nào"
        getRowKey={(item) => `${item.id}-${item.userName}-${item.dateTime}`}
        rowClassName={(item) => cn("hover:bg-secondary border-t", item.readding && "bg-secondary")}
        renderRow={(item, index) => (
          <>
            <td align="center" className="ps-2 pe-4 py-5 fs-xs text-gray">
              {index + 1}
            </td>
            <td className="px-2">
              <p className="pt-1 leading-5 fs-xs font-medium">{item.displayName}</p>
              <Link href="" className="fs-xs text-gray hover:underline">
                {item.userName}
              </Link>
            </td>
            <td className="px-2 fs-xs">{item.complaintType}</td>
            <td className="px-2 text-primary">
              <Link href={item.profileId} className="fs-xs font-medium hover:underline">
                {item.profileId}
              </Link>
            </td>
            <td className="px-2 fs-xs">{item.termOfService}</td>
            <td align="center" className="px-2 fs-xs">
              {item.reportCount}
            </td>
            <td className="px-2 fs-xs text-gray">{item.dateTime}</td>
            <td align="center" className="px-2">
              <Button type="button" className="me-3" onClick={() => handleRemoveComplaint(item.id)}>
                <TrashCanIcon className="size-5" />
              </Button>
              <Button
                type="button"
                className="relative"
                onClick={() => handleReadComplaint(item.id)}
              >
                <Pen className="size-[18px]" />
                {!item.readding && (
                  <div className="absolute -top-1 left-full size-2 bg-primary-gradient rounded-full" />
                )}
              </Button>
            </td>
          </>
        )}
      />
    </div>
  );
}
