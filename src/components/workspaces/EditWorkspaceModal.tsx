"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateWorkspaceAction } from "@/actions/workspaces/update-workspace";
import type { ApiWorkspaceWithGroups } from "@/lib/api/types";
import { SimpleModal } from "@/components/ui/simple-modal";
import { WorkspaceButton } from "./WorkspaceButton";

// Modal sua ten/mo ta workspace - form Y HET CreateWorkspaceModal.tsx nhung
// PRE-FILL gia tri hien tai, submit qua updateWorkspaceAction (da co san,
// TRUOC gio chua co UI nao goi toi). router.refresh() sau khi luu (giong
// CreateWorkspaceModal) vi WorkspaceSwitcher nhan `workspaces` qua prop tu
// Server Component, khong co state cuc bo de tu patch nhu cac form nhom.
export function EditWorkspaceModal({
  workspace,
  username,
  open,
  onOpenChange,
}: {
  workspace: ApiWorkspaceWithGroups;
  username: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState(workspace.name);
  const [description, setDescription] = useState(workspace.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function resetForm() {
    setName(workspace.name);
    setDescription(workspace.description ?? "");
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await updateWorkspaceAction(workspace.id, username, {
          name,
          description,
        });
        onOpenChange(false);
        router.refresh();
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
      title="Sửa workspace"
      description="Đổi tên hoặc mô tả của workspace này."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="edit-ws-name" className="text-xs font-semibold text-ink">
            Tên workspace
          </label>
          <input
            id="edit-ws-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Học tập, Film"
            className="h-9 rounded-md border border-border bg-surface px-3 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-primary"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="edit-ws-description"
            className="text-xs font-semibold text-ink"
          >
            Mô tả (tùy chọn)
          </label>
          <textarea
            id="edit-ws-description"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Workspace này dùng để lưu gì?"
            className="resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-primary"
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
