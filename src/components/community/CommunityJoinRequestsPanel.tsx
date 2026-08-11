"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type {
  CommunityJoinRequestDetailed,
  CommunityJoinRequestStatus,
} from "@/lib/community/types";
import { cn } from "@/lib/utils";
import { approveJoinRequestAction } from "@/actions/community/approve-join-request";
import { rejectJoinRequestAction } from "@/actions/community/reject-join-request";

const TABS: { status: CommunityJoinRequestStatus; label: string }[] = [
  { status: "pending", label: "Chờ duyệt" },
  { status: "approved", label: "Đã duyệt" },
  { status: "rejected", label: "Đã từ chối" },
];

// Panel "Yeu cau tham gia" - trang chinh cua giao dien Admin. Duyet/tu choi
// goi API THAT (approveJoinRequestAction/rejectJoinRequestAction) - backend
// da co san luong duyet thanh vien. Tim kiem loc THAT tren du lieu dang hien
// (substring khong phan biet hoa/thuong), "Bo loc" la nut trang tri (UI shell).
export function CommunityJoinRequestsPanel({
  communityId,
  communitySlug,
  initialRequests,
}: {
  communityId: string;
  communitySlug: string;
  initialRequests: CommunityJoinRequestDetailed[];
}) {
  const [requests, setRequests] = useState(initialRequests);
  const [activeStatus, setActiveStatus] =
    useState<CommunityJoinRequestStatus>("pending");
  const [search, setSearch] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const counts = useMemo(
    () => ({
      pending: requests.filter((r) => r.status === "pending").length,
      approved: requests.filter((r) => r.status === "approved").length,
      rejected: requests.filter((r) => r.status === "rejected").length,
    }),
    [requests],
  );

  const filtered = requests.filter((r) => {
    if (r.status !== activeStatus) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
    );
  });

  function handle(id: string, action: "approve" | "reject") {
    setPendingId(id);
    startTransition(async () => {
      if (action === "approve") {
        await approveJoinRequestAction(communityId, id, communitySlug);
      } else {
        await rejectJoinRequestAction(communityId, id, communitySlug);
      }
      // Cap nhat state cuc bo cho phan hoi UI tuc thi - revalidatePath trong
      // action da lam du lieu server dong bo o lan dieu huong/refetch sau.
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, status: action === "approve" ? "approved" : "rejected" }
            : r,
        ),
      );
      setPendingId(null);
    });
  }

  return (
    <div className="flex h-full flex-1 flex-col gap-4 overflow-y-auto py-4 pl-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-ink">
          Yêu cầu tham gia
        </h1>
        <p className="text-sm text-ink-faint">
          Quản lý các yêu cầu tham gia cộng đồng (private)
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
          {TABS.map(({ status, label }) => (
            <button
              key={status}
              type="button"
              onClick={() => setActiveStatus(status)}
              className={cn(
                "flex h-8 cursor-pointer items-center gap-1.5 rounded-sm px-3 text-sm font-medium transition-colors duration-150 ease-out",
                activeStatus === status
                  ? "bg-community-accent text-white"
                  : "text-ink-muted hover:bg-hover-bg hover:text-ink",
              )}
            >
              {label}
              {counts[status] > 0 && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                    activeStatus === status
                      ? "bg-surface/20"
                      : "bg-surface-muted",
                  )}
                >
                  {counts[status]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex h-9 items-center gap-2 rounded-md border border-border px-2.5">
            <Search
              size={14}
              strokeWidth={2}
              className="shrink-0 text-ink-faint"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm theo tên, email..."
              className="w-48 bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
            />
          </div>
          <button
            type="button"
            className="flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-border px-3 text-sm text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
          >
            <SlidersHorizontal size={14} strokeWidth={2} />
            Bộ lọc
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-left text-xs font-semibold text-ink-faint">
              <th className="px-4 py-2.5 font-semibold">Thành viên</th>
              <th className="px-4 py-2.5 font-semibold">Kinh nghiệm</th>
              <th className="px-4 py-2.5 font-semibold">Lý do muốn tham gia</th>
              <th className="px-4 py-2.5 font-semibold">Thời gian gửi</th>
              {activeStatus === "pending" && (
                <th className="px-4 py-2.5 text-right font-semibold">
                  Hành động
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-ink-faint"
                >
                  Không có yêu cầu nào.
                </td>
              </tr>
            )}
            {filtered.map((request) => (
              <tr key={request.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Image
                      src={request.avatarUrl}
                      alt={request.name}
                      width={32}
                      height={32}
                      className="size-8 shrink-0 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">
                        {request.name}
                      </p>
                      <p className="truncate text-xs text-ink-faint">
                        {request.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-ink-muted">
                  {request.experienceLabel}
                </td>
                <td className="max-w-xs px-4 py-3 text-ink-muted">
                  <p className="line-clamp-2">{request.reason}</p>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-ink-faint">
                  {request.submittedLabel}
                </td>
                {activeStatus === "pending" && (
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
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
                        {pendingId === request.id ? "Đang xử lý..." : "Duyệt"}
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="flex items-center justify-between text-sm text-ink-faint">
          <span>Hiển thị {filtered.length} yêu cầu</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled
              className="flex size-7 cursor-not-allowed items-center justify-center rounded-md text-ink-faint opacity-50"
            >
              <ChevronLeft size={14} strokeWidth={2} />
            </button>
            <span className="flex size-7 items-center justify-center rounded-md bg-community-accent text-xs font-semibold text-white">
              1
            </span>
            <button
              type="button"
              className="flex size-7 cursor-pointer items-center justify-center rounded-md text-ink-muted hover:bg-hover-bg hover:text-ink"
            >
              <ChevronRight size={14} strokeWidth={2} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
