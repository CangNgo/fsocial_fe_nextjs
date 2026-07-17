"use client";
import { Inbox } from "lucide-react";
import type { ReactNode } from "react";
import { TableVirtuoso } from "react-virtuoso";
import { LoadingIcon } from "@/shared/components/atoms/icon/icon";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/shared/components/ui/empty";
import { cn } from "@/shared/lib/utils";

interface DataTableProps<T> {
  headers: string[];
  loading?: boolean;
  data: T[];
  renderRow: (item: T, index: number) => ReactNode;
  getRowKey: (item: T, index: number) => string | number;
  rowClassName?: (item: T, index: number) => string;
  emptyText?: ReactNode;
  showIndex?: boolean;
  className?: string;
  bodyClassName?: string;
}

export function DataTable<T>({
  headers,
  loading = false,
  data,
  renderRow,
  getRowKey,
  rowClassName,
  emptyText,
  showIndex = true,
  className,
  bodyClassName,
}: DataTableProps<T>) {
  const totalCols = headers.length + (showIndex ? 1 : 0);

  return (
    <TableVirtuoso
      className={cn("flex-grow min-h-[500px] max-h-[700px]", className)}
      data={data}
      computeItemKey={(index, item) => getRowKey(item, index)}
      components={{
        Table: (props) => <table {...props} className="w-full border-collapse" />,
        TableBody: (props) => <tbody {...props} className={bodyClassName ?? "cursor-pointer"} />,
        TableRow: ({ item, ...props }) => (
          <tr {...props} className={rowClassName?.(item, props["data-index"])} />
        ),
        EmptyPlaceholder: () => (
          <tbody>
            <tr>
              <td colSpan={totalCols}>
                {loading ? (
                  <div className="mx-auto w-fit py-10">
                    <LoadingIcon />
                  </div>
                ) : (
                  emptyText && (
                    <Empty className="border-none py-10">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <Inbox />
                        </EmptyMedia>
                        <EmptyTitle className="fs-sm">{emptyText}</EmptyTitle>
                      </EmptyHeader>
                    </Empty>
                  )
                )}
              </td>
            </tr>
          </tbody>
        ),
      }}
      fixedHeaderContent={() => (
        <tr className="bg-accent text-xs text-muted-foreground">
          {showIndex && (
            <th scope="col" align="center" className="ps-2 pe-4 py-3 font-normal">
              STT
            </th>
          )}
          {headers.map((header) => (
            <th key={header} scope="col" className="px-2 font-normal">
              {header}
            </th>
          ))}
        </tr>
      )}
      itemContent={(index, item) => renderRow(item, index)}
    />
  );
}
