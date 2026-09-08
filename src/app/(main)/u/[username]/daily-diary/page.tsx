import { notFound } from "next/navigation";
import { getProfileOrRedirect } from "@/lib/api/get-profile-or-redirect";
import { getSelfStatusAction } from "@/actions/users/get-self-status";
import { listDiaryTopicsAction } from "@/actions/diary/list-diary-topics";
import { DiaryShell } from "@/components/diary/DiaryShell";

// Trang that GL Daily Diary - chan kep giong DailyDiaryAccessModal.tsx
// (/services/daily-diary): chi chinh chu (isSelf, cung pattern voi
// u/[username]/workspaces/new/page.tsx) VA la admin (isAdmin, xem
// UserService.getSelf) moi vao duoc, nguoi khac -> 404 (khong tiet lo tinh
// nang nay ton tai). AdminGuard o backend van chan doc lap moi request CRUD,
// day chi la gate hien thi trang.
export default async function DailyDiaryPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const uname = decodeURIComponent(username);

  const profile = await getProfileOrRedirect(uname);
  if (!profile?.isSelf) notFound();

  const status = await getSelfStatusAction();
  if (!status.isAdmin) notFound();

  const topics = await listDiaryTopicsAction();

  return <DiaryShell initialTopics={topics} />;
}
