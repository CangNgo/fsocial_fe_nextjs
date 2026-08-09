import { SettingNav } from "@/shared/components/organisms/setting-nav";

export default function SettingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen p-4">
      <SettingNav />
      <main className="flex-1 px-6 pb-6">{children}</main>
    </div>
  );
}
