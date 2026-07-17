"use client";

import { useMemo, useState } from "react";
import { CalendarIcon, TrashCanIcon } from "@/shared/components/atoms/icon/icon";
import { ButtonGroup } from "@/shared/components/molecules/button-group";
import { DataTable } from "@/shared/components/molecules/data-table";
import { SearchBar } from "@/shared/components/molecules/search-bar";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { formatDate, timeAgo } from "@/shared/utils/convert-date-time";
import { useBanUser } from "../../hooks/mutations/use-manage-user-mutations";
import { useManageUsers } from "../../hooks/queries/use-manage-users";

const buttonItems = ["Tất cả", "Bị cấm", "Bình thường"];

const headers = [
  "Người dùng",
  "Email",
  "Ngày tạo tài khoản",
  "Lần hoạt động cuối",
  "Hành động",
];

export default function AdminUserTable() {
  const { users, loading } = useManageUsers();
  const { mutate: mutateBanUser } = useBanUser();

  const [searchValue, setSearchValue] = useState("");
  const [selectedType, setSelectedType] = useState("Tất cả");

  const filteredData = useMemo(() => {
    return users
      .filter((item) => {
        if (selectedType.toLowerCase() === buttonItems[1].toLowerCase())
          return item.status === false;
        if (selectedType.toLowerCase() === buttonItems[2].toLowerCase())
          return item.status === true;
        return true;
      })
      .filter((item) =>
        Object.values(item).some((val) =>
          val?.toString().toLowerCase().includes(searchValue.toLowerCase()),
        ),
      );
  }, [users, selectedType, searchValue]);

  const handleSelected = (value: number) => {
    setSelectedType(buttonItems[value]);
  };

  const handleBanUser = (id: string) => {
    mutateBanUser(id);
  };

  return (
    <div className="pb-1 bg-background rounded-lg flex-grow border shadow flex flex-col gap-3">
      <div className="px-4 pt-4">
        <h5>Quản lý người dùng</h5>
        <p className="fs-sm text-gray">Hành động đối với tài khoản người dùng</p>
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
        emptyText="Không có người dùng nào"
        getRowKey={(item) => item.id}
        rowClassName={(item) =>
          cn(
            "hover:bg-secondary border-t transition",
            item.status === false && "hover:bg-primary-ghost bg-primary-ghost",
          )
        }
        renderRow={(item, index) => (
          <>
            <td align="center" className="ps-2 pe-4 py-5 fs-xs text-gray">
              {index + 1}
            </td>
            <td className="px-2">
              <p className="pt-1 leading-5 fs-xs font-medium">{item.displayName}</p>
              <p className="fs-xs text-gray">{item.username}</p>
            </td>
            <td className="px-2 fs-xs">{item.email}</td>
            <td className="px-2 fs-xs text-gray">{formatDate(item.createdAt)}</td>
            <td className="px-2 fs-xs text-gray">
              {item.updatedAt ? timeAgo(item.updatedAt) : "—"}
            </td>
            <td align="center" className="px-2">
              <Button
                type="button"
                className={cn(item.status === false && "text-destructive")}
                onClick={() => handleBanUser(item.id)}
                title={item.status === false ? "Bỏ chặn" : "Chặn người dùng"}
              >
                <TrashCanIcon className="size-5" />
              </Button>
            </td>
          </>
        )}
      />
    </div>
  );
}
