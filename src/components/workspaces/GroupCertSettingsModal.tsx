"use client";

import { useState, useTransition } from "react";
import { updateGroupAction } from "@/actions/knowledge-groups/update-group";
import type { ApiKnowledgeGroup } from "@/lib/api/types";
import { SimpleModal } from "@/components/ui/simple-modal";
import { WorkspaceButton } from "./WorkspaceButton";
import { useWorkspaceShell } from "./workspace-shell-context";

// Modal don gian sua ten/ma chung chi MUC TIEU cua nhom - hien trong
// GroupProgressWidget.tsx (tab Tong quan khi doc bai). Tai dung
// updateGroupAction/updateGroupInState da co san (giong EditGroupButton.tsx),
// chi them 2 field certName/certCode vao payload.
export function GroupCertSettingsModal({
  group,
  open,
  onOpenChange,
}: {
  group: ApiKnowledgeGroup;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { username, updateGroupInState } = useWorkspaceShell();
  const [certName, setCertName] = useState(group.certName ?? "");
  const [certCode, setCertCode] = useState(group.certCode ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function resetForm() {
    setCertName(group.certName ?? "");
    setCertCode(group.certCode ?? "");
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const updated = await updateGroupAction(group.id, username, {
          certName,
          certCode,
        });
        updateGroupInState(updated);
        onOpenChange(false);
      } catch {
        setError("Có lỗi xảy ra, thử lại sau.");
      }
    });
  }

  return (
    <SimpleModal
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) resetForm();
      }}
      title="Mục tiêu chứng chỉ"
      description="Đặt tên/mã chứng chỉ đang nhắm tới cho nhóm này."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="cert-name" className="text-xs font-semibold text-ink">
            Tên chứng chỉ
          </label>
          <input
            id="cert-name"
            required
            value={certName}
            onChange={(e) => setCertName(e.target.value)}
            placeholder="VD: AWS Solutions Architect"
            className="h-9 rounded-md border border-border bg-surface px-3 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-primary"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="cert-code" className="text-xs font-semibold text-ink">
            Mã chứng chỉ (tuỳ chọn)
          </label>
          <input
            id="cert-code"
            value={certCode}
            onChange={(e) => setCertCode(e.target.value)}
            placeholder="VD: AWS SAA-C03"
            className="h-9 rounded-md border border-border bg-surface px-3 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-primary"
          />
        </div>

        {error && <p className="text-xs font-medium text-danger">{error}</p>}

        <WorkspaceButton
          type="submit"
          disabled={isPending}
          showPlane={false}
          className="mt-1 w-full justify-center"
        >
          {isPending ? "Đang lưu..." : "Lưu"}
        </WorkspaceButton>
      </form>
    </SimpleModal>
  );
}
