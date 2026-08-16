"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createWorkspaceAction } from "@/actions/workspaces/create-workspace";
import { SimpleModal } from "@/components/ui/simple-modal";

// Modal thuan tuy "Tao workspace moi" - tach rieng khoi nut kich hoat (xem
// CreateWorkspaceButton.tsx, cho man rong chua co workspace nao) vi component
// nay con duoc mo tu 1 noi KHAC: tool "Tao workspace" trong
// ControlCenterReactor (dang ky qua workspace-toolbar-context.tsx, xem
// WorkspaceSwitcher.tsx) - reactor nam o layout.tsx, khong co san form/modal
// nay nen phai dung chung component o day thay vi copy lai logic.
export function CreateWorkspaceModal({
  open,
  onOpenChange,
  username,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function resetForm() {
    setName("");
    setDescription("");
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await createWorkspaceAction(username, { name, description });
        onOpenChange(false);
        resetForm();
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
      title="Tạo workspace mới"
      description="Mỗi workspace là 1 vùng kiến thức riêng - đặt tên để bắt đầu."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="ws-name" className="text-xs font-semibold text-ink">
            Tên workspace
          </label>
          <input
            id="ws-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Học tập, Film"
            className="h-9 rounded-md border border-border bg-surface px-3 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-community-accent"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="ws-description"
            className="text-xs font-semibold text-ink"
          >
            Mô tả (tùy chọn)
          </label>
          <textarea
            id="ws-description"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Workspace này dùng để lưu gì?"
            className="resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-community-accent"
          />
        </div>

        {error && <p className="text-xs font-medium text-danger">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="mt-1 h-9 cursor-pointer rounded-md bg-community-accent text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-community-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Đang tạo..." : "Tạo workspace"}
        </button>
      </form>
    </SimpleModal>
  );
}
