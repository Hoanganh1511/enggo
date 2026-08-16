"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Send, Check } from "lucide-react";
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
      <div className="flex flex-col items-center gap-2 rounded-2xl py-16 text-center">
        <Check
          size={28}
          strokeWidth={1.5}
          style={{ color: "var(--primary)" }}
        />
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
    >
      {/* unoptimized: bo qua route toi uu /_next/image - file goc tai duoc
          tuc thi (da xac nhan qua curl), nhung route toi uu bi treo
          "(pending)" mai khong xong voi dung file PNG nay (nghi do sharp xu
          ly PNG palette-color tren Windows), tro thang vao file goc la cach
          on dinh nhat cho 1 anh trang tri tinh, khong can responsive srcset. */}
      <Image
        src="/assets/images/workspaces/workspace-lock-knowledge.png"
        alt=""
        width={96}
        height={96}
        unoptimized
        className="size-24"
      />
      <p className="max-w-sm text-sm" style={{ color: "var(--ink-muted)" }}>
        Bạn cần được cấp quyền truy cập từ tác giả
      </p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Lý do muốn cộng tác (tùy chọn)..."
        rows={2}
        className="w-full max-w-sm resize-none rounded-md px-3 py-2 text-sm outline-none"
        style={{
          border: "1px solid var(--search-border)",
          background: "var(--surface-muted)",
          color: "var(--ink)",
        }}
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
        style={{
          background:
            "linear-gradient(135deg, var(--primary), var(--secondary))",
          color: "var(--on-primary)",
        }}
      >
        <Send size={14} strokeWidth={2.25} />
        {isPending ? "Đang gửi..." : "Gửi yêu cầu cộng tác"}
      </button>
    </form>
  );
}
