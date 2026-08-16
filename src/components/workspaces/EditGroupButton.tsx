"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { updateGroupAction } from "@/actions/knowledge-groups/update-group";
import type { ApiKnowledgeGroup, ApiKnowledgeGroupVisibility } from "@/lib/api/types";
import { SimpleModal } from "@/components/ui/simple-modal";
import { cn } from "@/lib/utils";
import { useWorkspaceShell } from "./workspace-shell-context";

// Icon but "Sua nhom" - CHUA co UI nao goi toi updateGroupAction da co san
// (chi PATCH /knowledge-groups/:id o backend, khong nut nao tren FE dung
// no) truoc yeu cau nay. Chi hien khi isSelf (backend update() dung
// assertGroupOwner - CHAT hon assertGroupWriter/viewerCanWrite ma
// collaborator APPROVED cung co, nen collaborator KHONG duoc sua ten/mo ta/
// quyen xem, chi chu workspace moi duoc). Form y het CreateGroupButton.tsx
// nhung PRE-FILL gia tri hien tai, submit qua updateGroupAction roi patch
// lai state cuc bo qua updateGroupInState (KHONG the spread nguyen response
// - xem comment trong WorkspaceShell.tsx).
export function EditGroupButton({ group }: { group: ApiKnowledgeGroup }) {
  const { username, updateGroupInState } = useWorkspaceShell();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description ?? "");
  const [visibility, setVisibility] = useState<ApiKnowledgeGroupVisibility>(group.visibility);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function resetForm() {
    setName(group.name);
    setDescription(group.description ?? "");
    setVisibility(group.visibility);
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const updated = await updateGroupAction(group.id, username, {
          name,
          description,
          visibility,
        });
        updateGroupInState(updated);
        setOpen(false);
      } catch {
        setError("Có lỗi xảy ra, thử lại sau.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Sửa nhóm kiến thức"
        aria-label="Sửa nhóm kiến thức"
        className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-faint transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
      >
        <Pencil size={12} strokeWidth={2} />
      </button>

      <SimpleModal
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) resetForm();
        }}
        title="Sửa nhóm kiến thức"
        description="Đổi tên, mô tả hoặc quyền xem của nhóm này."
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="edit-group-name" className="text-xs font-semibold text-ink">
              Tên nhóm
            </label>
            <input
              id="edit-group-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: React nâng cao"
              className="h-9 rounded-md border border-border bg-surface px-3 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-community-accent"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="edit-group-description" className="text-xs font-semibold text-ink">
              Mô tả (tùy chọn)
            </label>
            <textarea
              id="edit-group-description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-community-accent"
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-ink">Quyền xem</span>
            <div className="flex items-center gap-1 rounded-md border border-border bg-surface-muted p-1">
              {(
                [
                  { value: "PUBLIC", label: "Công khai" },
                  { value: "PRIVATE", label: "Riêng tư" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setVisibility(opt.value)}
                  className={cn(
                    "h-8 flex-1 cursor-pointer rounded-sm text-xs font-semibold transition-colors duration-150 ease-out",
                    visibility === opt.value
                      ? "bg-community-accent text-white"
                      : "text-ink-muted hover:text-ink",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-ink-faint">
              {visibility === "PUBLIC"
                ? "Ai cũng xem được bài đã xuất bản trong nhóm."
                : "Chỉ bạn và cộng tác viên được duyệt mới xem được."}{" "}
              Quyền viết bài luôn cần được duyệt, bất kể lựa chọn này.
            </p>
          </div>

          {error && <p className="text-xs font-medium text-danger">{error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="mt-1 h-9 cursor-pointer rounded-md bg-community-accent text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-community-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </form>
      </SimpleModal>
    </>
  );
}
