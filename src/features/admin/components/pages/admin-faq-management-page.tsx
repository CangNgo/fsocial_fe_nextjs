"use client";

import { Pencil, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { FaqDeleteDialog } from "@/features/admin/components/molecules/faq-delete-dialog";
import {
  DEFAULT_FAQ_TYPE,
  FAQ_TYPE_OPTIONS,
  getFaqTypeEmptyText,
  getFaqTypeLabel,
  isFaqType,
} from "@/features/admin/config/faq-config";
import { useFaqsByType } from "@/features/admin/hooks/queries/use-faqs";
import { DataTable } from "@/shared/components/molecules/data-table";
import { SearchBar } from "@/shared/components/molecules/search-bar";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/utils";
import type { FaqResponse } from "@/shared/types/faq";

const headers = ["Tên", "Mô tả", "Loại", "Lượt xem", "Đánh giá", "Điểm TB", "Hành động"];

function getSearchableText(faq: FaqResponse) {
  return [faq.name, faq.description, faq.type, faq.viewCount, faq.ratingCount, faq.averageRating]
    .filter((value) => value !== undefined && value !== null)
    .join(" ")
    .toLowerCase();
}

export default function AdminFaqManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const activeType = isFaqType(typeParam) ? typeParam : DEFAULT_FAQ_TYPE;
  const { faqs, loading, isError } = useFaqsByType(activeType);
  const [searchValue, setSearchValue] = useState("");

  const filteredFaqs = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();
    if (!normalizedSearch) return faqs;
    return faqs.filter((faq) => getSearchableText(faq).includes(normalizedSearch));
  }, [faqs, searchValue]);

  const handleTabChange = (value: string) => {
    if (!isFaqType(value)) return;
    setSearchValue("");
    router.replace(`${ROUTES.ADMIN.FAQS}?type=${value}`);
  };

  return (
    <div className="pb-1 bg-background rounded-lg flex-grow border shadow flex flex-col gap-3">
      <div className="px-4 pt-4">
        <h5>FAQ Management</h5>
        <p className="fs-sm text-gray">Quản lý FAQ, hướng dẫn và nội dung giới thiệu</p>
      </div>

      <Tabs value={activeType} onValueChange={handleTabChange} className="min-h-0 flex-1 gap-3">
        <div className="px-4 flex flex-col gap-3 flex-shrink-0 lg:flex-row lg:items-center lg:justify-between">
          <TabsList>
            {FAQ_TYPE_OPTIONS.map((option) => (
              <TabsTrigger key={option.value} value={option.value}>
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="flex h-10 gap-3 lg:w-[480px]">
            <SearchBar
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Tìm kiếm FAQ"
            />
            <Button asChild type="button" className="btn-transparent !w-fit px-3 border !rounded-lg">
              <Link href={ROUTES.ADMIN.FAQ_CREATE(activeType)}>
                <PlusIcon className="size-5" />
                <span>Thêm</span>
              </Link>
            </Button>
          </div>
        </div>

        {FAQ_TYPE_OPTIONS.map((option) => (
          <TabsContent key={option.value} value={option.value} className="mt-0 flex min-h-0 flex-1">
            <DataTable
              loading={loading}
              headers={headers}
              data={isError ? [] : filteredFaqs}
              emptyText={isError ? "Không thể tải dữ liệu FAQ" : getFaqTypeEmptyText(activeType)}
              getRowKey={(faq) => faq.id}
              rowClassName={() => "hover:bg-secondary border-t transition"}
              renderRow={(faq, index) => (
                <>
                  <td align="center" className="ps-2 pe-4 py-5 fs-xs text-gray">
                    {index + 1}
                  </td>
                  <td className="px-2 py-3">
                    <p className="fs-xs font-medium line-clamp-2">{faq.name}</p>
                  </td>
                  <td className="px-2 fs-xs text-gray">
                    <span className="line-clamp-2">{faq.description || "—"}</span>
                  </td>
                  <td className="px-2 fs-xs">{getFaqTypeLabel(faq.type)}</td>
                  <td align="center" className="px-2 fs-xs">
                    {faq.viewCount ?? 0}
                  </td>
                  <td align="center" className="px-2 fs-xs">
                    {faq.ratingCount ?? 0}
                  </td>
                  <td align="center" className="px-2 fs-xs">
                    {Number(faq.averageRating ?? 0).toFixed(1)}
                  </td>
                  <td align="center" className="px-2">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        asChild
                        type="button"
                        className={cn("btn-transparent border !size-8")}
                        title="Sửa FAQ"
                      >
                        <Link href={ROUTES.ADMIN.FAQ_EDIT(faq.id)}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <FaqDeleteDialog faq={faq} type={activeType} />
                    </div>
                  </td>
                </>
              )}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
