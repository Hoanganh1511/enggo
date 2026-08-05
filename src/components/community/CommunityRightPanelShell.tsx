import type { ReactNode } from "react";

// Khung <aside> dung chung cho ca 2 cot phai (Member: CommunityRightPanelMember,
// Admin: CommunityRightPanelAdmin) - truoc day copy className 2 noi.
//
// KHONG con nen/border/shadow rieng o day nua - noi dung ben trong gio la
// cac "box" trang rieng biet (xem CommunityRightPanelMember.tsx), khoang
// ho giua cac box + phia sau chung se lo nen wallpaper cua CommunityWorkspace.
// "pr-4" - de cot nay KHONG dinh sat le phai cua trang web.
export function CommunityRightPanelShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <aside className="flex h-full w-72 shrink-0 flex-col gap-4 overflow-y-auto py-4 pr-4">
      {children}
    </aside>
  );
}
