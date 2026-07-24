import HomeLayoutShell from "@/components/discover/HomeLayoutShell";

// Layout dung chung cho 3 trang con (For you/Following/Trending) - xem
// HomeLayoutShell.tsx de biet ly do dat search bar/composer/cot phai o day
// thay vi trong tung page.
export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HomeLayoutShell>{children}</HomeLayoutShell>;
}
