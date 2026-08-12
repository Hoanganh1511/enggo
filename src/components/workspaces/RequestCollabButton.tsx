"use client";

import { useState, useTransition } from "react";
import { Lock, Send, Check } from "lucide-react";
import { requestCollabAction } from "@/actions/knowledge-groups/request-collab";

// Hien thay cho PostGrid khi viewer khong co quyen ghi vao 1 nhom (chua phai
// chu workspace/collaborator APPROVED) - gui yeu cau cong tac kem ly do tuy
// chon. Khong co trang thai "pending" rieng tu API (backend khong tra ve
// status cho nguoi ngoai) nen chi hien "da gui" cuc bo sau khi submit thanh
// cong, khong theo doi duoc trang thai duyet real-time trong ban nay.
export function RequestCollabButton({ groupId }: { groupId: string }) {
  const [reason, setReason] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await requestCollabAction(groupId, reason.trim() || undefined);
        setSent(true);
      } catch {
        setError("Có lỗi xảy ra, thử lại sau.");
      }
    });
  }

  if (sent) {
    return (
      <div
        className="flex flex-col items-center gap-2 rounded-2xl py-16 text-center"
        style={{ border: "1px dashed var(--border)" }}
      >
        <Check size={28} strokeWidth={1.5} style={{ color: "var(--primary)" }} />
        <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
          Đã gửi yêu cầu cộng tác — chờ chủ workspace duyệt.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center gap-3 rounded-2xl py-16 text-center"
      style={{ border: "1px dashed var(--border)" }}
    >
      <Lock size={28} strokeWidth={1.5} style={{ color: "var(--ink-faint)" }} />
      <p className="max-w-xs text-sm" style={{ color: "var(--ink-muted)" }}>
        Nhóm này riêng tư. Gửi yêu cầu cộng tác để viết bài chung.
      </p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Lý do muốn cộng tác (tùy chọn)..."
        rows={2}
        className="w-full max-w-xs resize-none rounded-md px-3 py-2 text-sm outline-none"
        style={{ border: "1px solid var(--search-border)", background: "var(--surface-muted)", color: "var(--ink)" }}
      />
      {error && (
        <p className="text-xs font-medium" style={{ color: "var(--danger)" }}>
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-opacity duration-150 ease-out hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))", color: "var(--on-primary)" }}
      >
        <Send size={14} strokeWidth={2.25} />
        {isPending ? "Đang gửi..." : "Gửi yêu cầu cộng tác"}
      </button>
    </form>
  );
}
