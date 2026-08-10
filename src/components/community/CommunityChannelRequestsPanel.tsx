"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Hash } from "lucide-react";
import type { CommunityChannelRequest } from "@/lib/community/types";
import { approveChannelAction } from "@/actions/community/approve-channel";
import { rejectChannelAction } from "@/actions/community/reject-channel";

// Panel "Kênh & Danh mục" trong sidebar Quản trị - duyệt/từ chối kênh do
// thành viên thường đề xuất (xem CreateChannelButton.tsx). KHAC
// CommunityJoinRequestsPanel.tsx (van con la UI-only, chi doi state cuc bo) -
// panel nay goi API THAT (approveChannelAction/rejectChannelAction), vi
// backend cho luong duyet kenh da duoc xay dung day du trong phien nay.
export function CommunityChannelRequestsPanel({
  communityId,
  communitySlug,
  initialRequests,
}: {
  communityId: string;
  communitySlug: string;
  initialRequests: CommunityChannelRequest[];
}) {
  const [requests, setRequests] = useState(initialRequests);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handle(id: string, action: "approve" | "reject") {
    setPendingId(id);
    startTransition(async () => {
      if (action === "approve") {
        await approveChannelAction(communityId, id, communitySlug);
      } else {
        await rejectChannelAction(communityId, id, communitySlug);
      }
      setRequests((prev) => prev.filter((r) => r.id !== id));
      setPendingId(null);
    });
  }

  return (
    <div className="flex h-full flex-1 flex-col gap-4 overflow-y-auto py-4 pl-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-ink">
          Kênh & Danh mục
        </h1>
        <p className="text-sm text-ink-faint">
          Duyệt các kênh do thành viên đề xuất
        </p>
      </div>

      {requests.length === 0 ? (
        <p className="py-12 text-center text-sm text-ink-faint">
          Không có kênh nào đang chờ duyệt.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map((request) => (
            <div
              key={request.id}
              className="flex items-start justify-between gap-4 rounded-lg border border-border bg-white p-4"
            >
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-community-accent/10 text-community-accent">
                  <Hash size={16} strokeWidth={2.25} />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-ink">
                    #{request.slug} · {request.name}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-sm text-ink-muted">
                    {request.description}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-faint">
                    {request.requesterAvatarUrl && (
                      <Image
                        src={request.requesterAvatarUrl}
                        alt={request.requesterName}
                        width={16}
                        height={16}
                        className="size-4 shrink-0 rounded-full object-cover"
                      />
                    )}
                    <span>
                      Đề xuất bởi {request.requesterName} ·{" "}
                      {request.submittedLabel}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  disabled={pendingId === request.id}
                  onClick={() => handle(request.id, "reject")}
                  className="flex h-8 cursor-pointer items-center rounded-md border border-border px-3 text-xs font-semibold text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Từ chối
                </button>
                <button
                  type="button"
                  disabled={pendingId === request.id}
                  onClick={() => handle(request.id, "approve")}
                  className="flex h-8 cursor-pointer items-center rounded-md bg-community-accent px-3 text-xs font-semibold text-white transition-colors duration-150 ease-out hover:bg-community-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Duyệt
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
