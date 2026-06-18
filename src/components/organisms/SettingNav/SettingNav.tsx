"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { settingNavRoute } from "@/config/settingNavRoute";
import { cn } from "@/lib/utils";

export function SettingNav() {
  const pathname = usePathname();
  return (
    <div className="pt-5 px-5 h-full w-[300px] border-r space-y-2">
      <h4 className="mb-5">Cài đặt</h4>
      {settingNavRoute.map((item) => (
        <Link
          key={item.to}
          href={item.to}
          className={cn(
            "w-full flex items-center gap-4 px-2 py-3 rounded-md hover:bg-accent transition",
            pathname === item.to && "bg-accent",
          )}
        >
          {item.icon} {item.content}
        </Link>
      ))}
    </div>
  );
}
