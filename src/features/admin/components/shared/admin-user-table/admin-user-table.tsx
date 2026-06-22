// @ts-nocheck
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/shared/components/atoms/button";
import { CalendarIcon, TrashCanIcon } from "@/shared/components/atoms/icon";
import { Switch } from "@/shared/components/atoms/switch";
import { ButtonGroup } from "@/shared/components/molecules/button-group";
import { DataTable } from "@/shared/components/molecules/data-table";
import { SearchBar } from "@/shared/components/molecules/search-bar";
import { cn } from "@/shared/lib/utils";
import { getBanUser, getManageUser } from "../../../api/admin-manage-user-api";

interface UserItem {
  id: string;
  displayName: string;
  userName: string;
  complaint: string;
  createDate: string;
  onlineLated: string;
  status: boolean;
}

const buttonItems = ["Tất cả", "Bị cấm", "Bình thường"];

const headers = [
  "Người dùng",
  "Đường dẫn tài khoản",
  "Ngày tạo tài khoản",
  "Lần hoạt động cuối",
  "Hành động",
];

export function AdminUserTable() {
  const [searchValue, setSearchValue] = useState("");
  const [data, setData] = useState<UserItem[]>([]);
  const [filteredData, setFilteredData] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [_selected, setSelected] = useState("Tất cả");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getManageUser();
        const fetched: UserItem[] = res?.data ?? [];
        setData(fetched);
        setFilteredData(fetched);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const result = data.filter((item) =>
      Object.values(item).some((val) =>
        val?.toString().toLowerCase().includes(searchValue.toLowerCase()),
      ),
    );
    setFilteredData(result);
  }, [searchValue, data]);

  const handleSelected = (value: number) => {
    const currentSelected = buttonItems[value];
    if (currentSelected.toLowerCase() !== buttonItems[0].toLowerCase()) {
      setFilteredData(
        data.filter((item) => {
          if (currentSelected.toLowerCase() === buttonItems[1].toLowerCase()) {
            return item.status === true;
          } else {
            return item.status === false;
          }
        }),
      );
    } else {
      setFilteredData(data);
    }
    setSelected(currentSelected);
  };

  const handleToggleBan = async (id: string) => {
    setData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: !item.status } : { ...item })),
    );
    try {
      await getBanUser(id);
    } catch {
      // revert optimistic update on error
      setData((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: !item.status } : { ...item })),
      );
    }
  };

  const handleRemoveUser = (id: string) => {
    setData((prev) => prev.filter((item) => item.id !== id));
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
