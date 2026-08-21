"use client";

import MechanicalPanel from "./MechanicalPanel";

// 2 dropdown noi dung con lai cua TopHeaderBar (Thong bao da tach rieng sang
// NotificationsPanel.tsx, Tin nhan da co trang /messages that rieng - xem
// MessagesShell.tsx) - vo MechanicalPanel giu nguyen, nhung phan NOI DUNG
// BEN TRONG (truoc day la data demo/placeholder gia) da bo TAM THOI, chi con
// 1 empty state trung thuc, cho toi khi co API that (bookmark that) noi vao.
function EmptyPanelState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
      <p className="text-[11px]" style={{ color: "var(--ink-faint)" }}>
        {text}
      </p>
    </div>
  );
}

export function SavedPanel() {
  return (
    <MechanicalPanel title="Đã lưu" width="w-[340px]">
      <EmptyPanelState text="Chưa có mục nào được lưu." />
    </MechanicalPanel>
  );
}

export function HelpPanel() {
  return (
    <MechanicalPanel title="Trợ giúp" width="w-[320px]">
      <EmptyPanelState text="Chưa có nội dung trợ giúp nào." />
    </MechanicalPanel>
  );
}
