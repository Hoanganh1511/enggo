import HomeLayoutShell from "@/components/discover/HomeLayoutShell";

// Layout dung chung cho 5 trang con (Bài đăng/Thành tích mới/Tiến độ/For IT/
// Vote) - xem HomeLayoutShell.tsx de biet ly do dat search bar/composer/cot
// phai o day thay vi trong tung page.
export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HomeLayoutShell>{children}</HomeLayoutShell>;
}
