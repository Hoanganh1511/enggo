"use client";

import { useEffect, useState, useTransition } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Folder, FileText, Target, X } from "lucide-react";
import { getNodeAction } from "@/actions/career-tree/get-node";
import { getNodeCardsAction } from "@/actions/career-tree/get-node-cards";
import { extractPlainText } from "@/lib/career-tree/extract-plain-text";
import { hexToRgba } from "@/lib/skill-tree/status-style";
import ActivityLog, {
  type Activity,
} from "@/components/career-tree/node-detail/ActivityLog";
import Spinner from "@/components/ui/spinner";
import type { ApiCard, ApiNode, NodeKind } from "@/lib/api/types";

const KIND_ICON: Record<NodeKind, typeof Target> = {
  BRANCH: Folder,
  TOPIC: FileText,
};

function toActivity(card: ApiCard): Activity {
  return {
    id: card.id,
    text: extractPlainText(card.content) || "Trống",
    time: card.createdAt,
    kind: card.kind,
  };
}

type SkillReportDetailModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  nodeId: string;
  nodeTitle: string;
  categoryName: string;
  categoryAccent: string;
};

// Modal "xem chi tiet" cho bai bao cao ky nang (SkillReportBody.tsx) - CHI
// XEM, khong sua/xoa gi (luong sua that van la trang Node Detail day du, xem
// node-detail-container.tsx). Style theo dung pattern NodeQuickViewModal.tsx
// (Radix Dialog, onOpenAutoFocus chan lai de tranh Tooltip con nao do tu mo
// ngay khi modal mo).
const SkillReportDetailModal = ({
  open,
  onOpenChange,
  workspaceId,
  nodeId,
  nodeTitle,
  categoryName,
  categoryAccent,
}: SkillReportDetailModalProps) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay" />
        <Dialog.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="fixed top-1/2 left-1/2 z-50 flex max-h-[80vh] w-[calc(100%-3rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-border bg-surface p-6 shadow-panel focus:outline-none"
        >
          {/* Body chi mount khi modal dang mo (Radix chi render Content luc
              open=true) - nho vay state fetch ben trong tu reset ve idle moi
              lan mo lai (co the la 1 bai bao cao KHAC) qua unmount/remount,
              khong can effect rieng de "reset ve idle" (tranh setState dong
              bo trong effect - react-hooks/set-state-in-effect). */}
          {open && (
            <SkillReportDetailBody
              workspaceId={workspaceId}
              nodeId={nodeId}
              nodeTitle={nodeTitle}
              categoryName={categoryName}
              categoryAccent={categoryAccent}
            />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

type SkillReportDetailBodyProps = Omit<
  SkillReportDetailModalProps,
  "open" | "onOpenChange"
>;

function SkillReportDetailBody({
  workspaceId,
  nodeId,
  nodeTitle,
  categoryName,
  categoryAccent,
}: SkillReportDetailBodyProps) {
  const [status, setStatus] = useState<"idle" | "loaded" | "error">("idle");
  const [node, setNode] = useState<ApiNode | null>(null);
  const [cards, setCards] = useState<ApiCard[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (status !== "idle") return;
    startTransition(async () => {
      try {
        const [nodeResult, cardsResult] = await Promise.all([
          getNodeAction(workspaceId, nodeId),
          getNodeCardsAction(nodeId),
        ]);
        setNode(nodeResult);
        setCards(cardsResult);
        setStatus("loaded");
      } catch {
        setStatus("error");
      }
    });
  }, [status, workspaceId, nodeId]);

  const Icon = node ? KIND_ICON[node.kind] : Target;

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
            style={{
              background: hexToRgba(categoryAccent, 0.14),
              color: categoryAccent,
            }}
          >
            {categoryName}
          </span>
          <div className="mt-2 flex items-center gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted">
              <Icon size={16} strokeWidth={1.75} className="text-icon-active" />
            </span>
            <Dialog.Title className="truncate text-base font-medium text-ink">
              {nodeTitle}
            </Dialog.Title>
          </div>
        </div>
        <Dialog.Close asChild>
          <button
            type="button"
            className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-faint transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
          >
            <X size={15} strokeWidth={1.75} />
          </button>
        </Dialog.Close>
      </div>

      {isPending && status === "idle" && (
        <div className="flex min-h-32 flex-1 flex-col items-center justify-center gap-2 text-xs text-ink-muted">
          <Spinner size={18} />
          <span>Đang tải...</span>
        </div>
      )}

      {status === "error" && (
        <p className="mt-6 text-center text-sm text-ink-muted">
          Không tải được nội dung, thử lại sau.
        </p>
      )}

      {status === "loaded" && node && (
        <div className="mt-4 min-h-0 flex-1 overflow-y-auto">
          {node.goal ? (
            <p className="text-sm text-ink-muted">{node.goal}</p>
          ) : (
            <p className="text-sm text-ink-faint italic">Chưa có mô tả.</p>
          )}
          <div className="mt-4 border-t border-border pt-4">
            <ActivityLog activities={cards.map(toActivity)} readOnly hideLabel />
          </div>
        </div>
      )}
    </>
  );
}

export default SkillReportDetailModal;
