"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus } from "lucide-react";
import { createWorkspaceAction } from "@/actions/workspaces/create-workspace";
import { SimpleModal } from "@/components/ui/simple-modal";
import { WorkspaceButton } from "./WorkspaceButton";

// Modal thuan tuy "Tao workspace moi" - tach rieng khoi nut kich hoat (xem
// CreateWorkspaceButton.tsx/CreateWorkspaceCard trong WorkspaceSwitcher.tsx,
// cho man rong/luoi da co workspace) vi component nay con duoc mo tu 1 noi
// KHAC: tool "Tao workspace" tren WorkspaceQuickToolbar (dang ky qua
// workspace-toolbar-context.tsx, xem WorkspaceSwitcher.tsx) - toolbar nam o
// layout.tsx, khong co san form/modal nay nen phai dung chung component o
// day thay vi copy lai logic.
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
            className="h-9 rounded-md border border-border bg-surface px-3 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-primary"
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
            className="resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-primary"
          />
        </div>

        {/* Chua co field luu anh nen o backend (ApiWorkspace khong co
            field nay) - hien disabled that su thay vi gia vo co chuc nang,
            dung quy uoc "Sắp có" da ap dung o WorkspaceQuickToolbar.tsx. */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-ink">
            Ảnh nền workspace{" "}
            <span className="font-normal text-ink-faint">· Sắp có</span>
          </label>
          <button
            type="button"
            disabled
            title="Sắp có"
            className="flex h-16 w-full cursor-not-allowed flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-border text-ink-faint opacity-70"
          >
            <ImagePlus size={16} strokeWidth={1.9} />
            <span className="text-[11px]">Tải ảnh lên</span>
          </button>
        </div>

        {error && <p className="text-xs font-medium text-danger">{error}</p>}

        <WorkspaceButton
          type="submit"
          disabled={isPending}
          showPlane={false}
          className="mt-1 w-full justify-center"
        >
          {isPending ? "Đang tạo..." : "Tạo workspace"}
        </WorkspaceButton>
      </form>
    </SimpleModal>
  );
}
