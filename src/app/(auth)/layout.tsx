import { GoogleOneTap } from "@/features/auth";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-background">
      {children}
      <GoogleOneTap />
    </div>
  );
}
