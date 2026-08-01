import HomeLayoutShell from "@/components/discover/HomeLayoutShell";

// Layout cho trang Home duy nhat (page.tsx, dieu khien qua query param
// world/topic/type/mode) - xem HomeLayoutShell.tsx de biet ly do dat search
// bar/composer/cot phai o day thay vi trong page.
export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HomeLayoutShell>{children}</HomeLayoutShell>;
}
