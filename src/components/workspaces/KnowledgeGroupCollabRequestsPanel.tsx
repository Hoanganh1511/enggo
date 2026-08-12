"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Check, X } from "lucide-react";
import type { ApiKnowledgeGroupCollabRequest } from "@/lib/api/types";
import { approveCollabAction } from "@/actions/knowledge-groups/approve-collab";
import { rejectCollabAction } from "@/actions/knowledge-groups/reject-collab";

// Ban gon cua CommunityJoinRequestsPanel.tsx - chi list don gian + nut
// Approve/Reject, khong can tab/pagination/search (so luong yeu cau cong tac
// 1 nhom kien thuc thap hon nhieu so voi join request cong dong). Optimistic
// local state patch giong pattern goc - server revalidatePath se dong bo lai
// khi trang duoc refetch.
export function KnowledgeGroupCollabRequestsPanel({
  groupId,
  username,
  initialRequests,
}: {
  groupId: string;
  username: string;
  initialRequests: ApiKnowledgeGroupCollabRequest[];
}) {
  const [requests, setRequests] = useState(initialRequests);
  const [, startTransition] = useTransition();

  function handle(collabId: string, action: "approve" | "reject") {
    startTransition(async () => {
      if (action === "approve") {
        await approveCollabAction(groupId, collabId, username);
      } else {
        await rejectCollabAction(groupId, collabId, username);
      }
      setRequests((prev) => prev.filter((r) => r.id !== collabId));
    });
  }

  if (requests.length === 0) return null;

  return (
    <div
      className="mb-4 flex flex-col gap-2 rounded-2xl p-3"
      style={{ border: "1px solid var(--border)", background: "var(--surface-muted)" }}
    >
      <p className="text-xs font-semibold tracking-wide uppercase" style={{ color: "var(--ink-faint)" }}>
        Yêu cầu cộng tác ({requests.length})
      </p>
      {requests.map((r) => (
        <div key={r.id} className="flex items-center gap-2.5 rounded-lg p-2" style={{ background: "var(--surface)" }}>
          <Image
            src={r.user.avatarUrl}
            alt={r.user.name}
            width={32}
            height={32}
            className="size-8 shrink-0 rounded-full object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold" style={{ color: "var(--ink)" }}>
              {r.user.name}
            </p>
            {r.joinReason && (
              <p className="truncate text-xs" style={{ color: "var(--ink-faint)" }}>
                {r.joinReason}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => handle(r.id, "approve")}
            title="Duyệt"
            className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-150 ease-out"
            style={{ background: "var(--outline-bg)", color: "var(--primary)" }}
          >
            <Check size={14} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={() => handle(r.id, "reject")}
            title="Từ chối"
            className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-150 ease-out"
            style={{ background: "color-mix(in srgb, var(--danger) 12%, transparent)", color: "var(--danger)" }}
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>
      ))}
    </div>
  );
}
