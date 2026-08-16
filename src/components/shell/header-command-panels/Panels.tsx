"use client";

import { Bookmark, CircleHelp, MessageCircle } from "lucide-react";
import MechanicalPanel from "./MechanicalPanel";

// 3 dropdown noi dung con lai cua TopHeaderBar (Thong bao da tach rieng sang
// NotificationsPanel.tsx - dung du lieu THAT, xem file do) - vo MechanicalPanel
// giu nguyen, nhung phan NOI DUNG BEN TRONG (truoc day la data demo/placeholder
// gia - "Roadmap Frontend Developer 2024", "AI Assistant nhan tin"...) da bo
// TAM THOI, chi con 1 empty state trung lap, cho toi khi co API that (tin
// nhan/bookmark that) noi vao.
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
    <MechanicalPanel
      title="Đã lưu"
      eyebrow="LIBRARY"
      icon={<Bookmark size={17} />}
      width="w-[340px]"
    >
      <EmptyPanelState text="Chưa có mục nào được lưu." />
    </MechanicalPanel>
  );
}

export function MessagesPanel() {
  return (
    <MechanicalPanel
      title="Tin nhắn"
      eyebrow="COMMUNICATION"
      icon={<MessageCircle size={17} />}
      width="w-[320px]"
    >
      <EmptyPanelState text="Chưa có tin nhắn nào." />
    </MechanicalPanel>
  );
}

export function HelpPanel() {
  return (
    <MechanicalPanel
      title="Trợ giúp"
      eyebrow="SYSTEM SUPPORT"
      icon={<CircleHelp size={17} />}
      width="w-[320px]"
    >
      <EmptyPanelState text="Chưa có nội dung trợ giúp nào." />
    </MechanicalPanel>
  );
}
