import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { TrackingTabs } from "@/components/tracking/TrackingTabs";

// /tracking - khu vuc lap ke hoach + nang luong ca nhan (7 module). Nested
// trong (feed) de tu thua huong HomeDashboardSidebar + dashboard-scope (xem
// (feed)/layout.tsx) - chi can lo thanh tab ngang RIENG cho 7 module con o
// day, khong dung sidebar rieng (da chot voi nguoi dung: 1 muc "Tracking"
// trong sidebar chung, khong phai 7 muc rieng).
export default async function TrackingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.userId) redirect("/login");

  return (
    <div className="flex flex-col gap-5">
      <TrackingTabs />
      {children}
    </div>
  );
}
