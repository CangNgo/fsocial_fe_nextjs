"use client";
import type { ReactNode } from "react";
import { LoadingIcon } from "@/shared/components/atoms/icon/icon";

interface DataTableProps {
  headers: string[];
  loading?: boolean;
  children?: ReactNode;
}

export function DataTable({ headers, loading = false, children }: DataTableProps) {
  return (
    <div className="relative flex-grow overflow-y-auto">
      <table className="w-full text-left">
        <thead className="bg-accent text-xs text-muted-foreground sticky top-0 z-10">
          <tr>
            <th scope="col" align="center" className="ps-2 pe-4 py-3 font-normal">
              STT
            </th>
            {headers.map((header) => (
              <th key={header} scope="col" className="px-2 font-normal">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="cursor-pointer">
          {loading && (
            <tr className="h-52">
              <td colSpan={headers.length + 1}>
                <div className="mx-auto w-fit">
                  <LoadingIcon />
                </div>
              </td>
            </tr>
          )}
          {children}
        </tbody>
      </table>
    </div>
  );
}
