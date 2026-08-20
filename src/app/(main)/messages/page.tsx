import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MessagesShell } from "@/components/chat/MessagesShell";

// Trang Tin nhan that (1-1) - port tu source treecareer-profile-universe-v2,
// BO BOT so voi mockup goc theo pham vi MVP da chot: khong "Spaces" (aside
// navy ben trai), khong InfoPanel (aside ben phai voi File&Media/Cuoc tro
// chuyen chung). Dung lai header/MainContentArea that cua app (khong dung
// header rieng nhu source) - xem (main)/layout.tsx.
export default async function MessagesPage() {
  const session = await auth();
  if (!session?.userId) redirect("/login");

  return <MessagesShell />;
}
