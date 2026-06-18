import { SettingNav } from "@/components/organisms/SettingNav";

export default function SettingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <SettingNav />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
