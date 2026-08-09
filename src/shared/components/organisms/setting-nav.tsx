"use client";
import { settingNavRoute } from "@/shared/config/setting-nav-route";
import { cn } from "@/shared/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SettingNav() {
  const pathname = usePathname();
  return (
    <div className="p-5 h-full w-75 border-r space-y-2 bg-background lg:rounded-lg">
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
