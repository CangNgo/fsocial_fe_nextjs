"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarIcon, TrashCanIcon } from "@/shared/components/atoms/icon/icon";
import { ButtonGroup } from "@/shared/components/molecules/button-group";
import { DataTable } from "@/shared/components/molecules/data-table";
import { SearchBar } from "@/shared/components/molecules/search-bar";
import { Button } from "@/shared/components/ui/button";
import { Switch } from "@/shared/components/ui/switch";
import { cn } from "@/shared/lib/utils";
import { useBanUser } from "../../hooks/mutations/use-manage-user-mutations";
import { useManageUsers } from "../../hooks/queries/use-manage-users";

const buttonItems = ["Tất cả", "Bị cấm", "Bình thường"];

const headers = [
  "Người dùng",
  "Đường dẫn tài khoản",
  "Ngày tạo tài khoản",
  "Lần hoạt động cuối",
  "Hành động",
];

export default function AdminUserTable() {
  const { users, loading } = useManageUsers();
  const { mutate: mutateBanUser } = useBanUser();

  const [searchValue, setSearchValue] = useState("");
  const [selectedType, setSelectedType] = useState("Tất cả");
  const [removedIds, setRemovedIds] = useState<string[]>([]);

  const filteredData = useMemo(() => {
    return users
      .filter((item) => !removedIds.includes(item.id))
      .filter((item) => {
        if (selectedType.toLowerCase() === buttonItems[1].toLowerCase())
          return item.status === true;
        if (selectedType.toLowerCase() === buttonItems[2].toLowerCase())
          return item.status === false;
        return true;
      })
      .filter((item) =>
        Object.values(item).some((val) =>
          val?.toString().toLowerCase().includes(searchValue.toLowerCase()),
        ),
      );
  }, [users, removedIds, selectedType, searchValue]);

  const handleSelected = (value: number) => {
    setSelectedType(buttonItems[value]);
  };

  const handleToggleBan = (id: string) => {
    mutateBanUser(id);
  };

  const handleRemoveUser = (id: string) => {
    setRemovedIds((prev) => [...prev, id]);
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

      <DataTable loading={loading} headers={headers}>
        {filteredData.map((item, index) => (
          <tr
            key={item.id}
            className={cn(
              `hover:bg-secondary border-t transition ${
                item.status && "hover:bg-primary-ghost bg-primary-ghost"
              }`,
            )}
          >
            <td align="center" className="ps-2 pe-4 py-5 fs-xs text-gray">
              {index + 1}
            </td>
            <td className="px-2">
              <p className="pt-1 leading-5 fs-xs font-medium">{item.displayName}</p>
              <Link href="" className="fs-xs text-gray hover:underline">
                {item.userName}
              </Link>
            </td>
            <td className="px-2 text-primary">
              <Link href={item.complaint} className="fs-xs font-medium hover:underline">
                {item.complaint}
              </Link>
            </td>
            <td className="px-2 fs-xs text-gray">{item.createDate}</td>
            <td className="px-2 fs-xs text-gray">{item.onlineLated}</td>
            <td align="center" className="px-2">
              <Button type="button" className="me-2" onClick={() => handleRemoveUser(item.id)}>
                <TrashCanIcon className="size-5" />
              </Button>
              <Switch
                className="bg-gray-2light scale-[85%]"
                checked={item.status === true}
                onCheckedChange={() => handleToggleBan(item.id)}
              />
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
