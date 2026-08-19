"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { createGroupAction } from "@/actions/knowledge-groups/create-group";
import type { ApiKnowledgeGroup, ApiKnowledgeGroupVisibility } from "@/lib/api/types";
import { SimpleModal } from "@/components/ui/simple-modal";
import { cn } from "@/lib/utils";
import { GroupIconPicker } from "./GroupIconPicker";
import { WorkspaceButton } from "./WorkspaceButton";

// Nut "+ Tao nhom kien thuc" trong 1 workspace da chon. Khac
// CreateWorkspaceButton o cho khong router.refresh() - goi onCreated de
// WorkspaceSwitcher tu cap nhat state cuc bo (khong reload ca trang, dang o
// giua tuong tac drill-down).
export function CreateGroupButton({
  workspaceId,
  username,
  onCreated,
}: {
  workspaceId: string;
  username: string;
  onCreated: (group: ApiKnowledgeGroup) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<ApiKnowledgeGroupVisibility>("PRIVATE");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function resetForm() {
    setName("");
    setDescription("");
    setIcon(null);
    setVisibility("PRIVATE");
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const group = await createGroupAction(workspaceId, username, {
          name,
          description,
          icon: icon ?? undefined,
          visibility,
        });
        setOpen(false);
        resetForm();
        onCreated(group);
      } catch {
        setError("Có lỗi xảy ra, thử lại sau.");
      }
    });
  }

  return (
    <>
      {/* Mau gradient/bo cuc CTA lay dung tu thiet ke "khu vuon tri thuc"
          (KnowledgeGroupFloors.tsx) - noi DUY NHAT con dung nut nay sau khi
          WorkspaceSidebar.tsx (kieu nut vien dashed cu) bi xoa. Hover NHE -
          chi nang shadow + sang nhe (brightness), KHONG con khoi tron mo
          phong to tu tam (nguoi dung phan anh "hiệu ứng hover vào hơi đậm và
          xấu"). */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-[#25bddd] to-[#3574ee] px-5 py-3 text-[14px] font-semibold text-white shadow-[0_6px_16px_rgba(45,130,235,.16)] transition-all duration-200 ease-out hover:shadow-[0_9px_20px_rgba(45,130,235,.22)] hover:brightness-[1.05]"
      >
        <Plus className="h-4 w-4" />
        Tạo nhóm kiến thức
      </button>

      <SimpleModal
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) resetForm();
        }}
        title="Tạo nhóm kiến thức mới"
        description="1 nhóm kiến thức gom các bài viết cùng chủ đề trong workspace này."
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="group-name" className="text-xs font-semibold text-ink">
              Tên nhóm
            </label>
            <input
              id="group-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: React nâng cao"
              className="h-9 rounded-md border border-border bg-surface px-3 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="group-description" className="text-xs font-semibold text-ink">
              Mô tả (tùy chọn)
            </label>
            <textarea
              id="group-description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-ink">Icon nhóm (tuỳ chọn)</span>
            <GroupIconPicker value={icon} onChange={setIcon} />
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
                    // Concept mau khu vuc Workspace la gradient xanh duong co
                    // dinh (xem docs/workspace-style-guide.md muc 8), KHONG
                    // dung bg-community-accent (tim - accent rieng cua
                    // Community, khac feature).
                    visibility === opt.value
                      ? "bg-gradient-to-r from-[#20c5d8] to-[#326eea] text-white"
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

          <WorkspaceButton
            type="submit"
            disabled={isPending}
            showPlane={false}
            className="mt-1 w-full justify-center"
          >
            {isPending ? "Đang tạo..." : "Tạo nhóm"}
          </WorkspaceButton>
        </form>
      </SimpleModal>
    </>
  );
}
