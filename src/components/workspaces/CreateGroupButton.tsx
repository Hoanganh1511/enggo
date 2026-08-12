"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { createGroupAction } from "@/actions/knowledge-groups/create-group";
import type { ApiKnowledgeGroup, ApiKnowledgeGroupVisibility } from "@/lib/api/types";
import TransformModal from "@/components/ui/transform-modal";
import {
  ModalErrorText,
  ModalFieldLabel,
  ModalHint,
  ModalInput,
  ModalSegmentedToggle,
  ModalSubmitButton,
  ModalTextarea,
} from "@/components/ui/modal-form";

// Nut "+ Tao nhom kien thuc" trong 1 workspace da chon. Khac
// CreateWorkspaceButton o cho khong router.refresh() - goi onCreated de
// WorkspaceSwitcher tu cap nhat state cuc bo (khong reload ca trang, dang o
// giua tuong tac drill-down). Dung CHUNG TransformModal + form-kit voi
// CreateWorkspaceModal.tsx (xem components/ui/modal-form.tsx) - truoc day
// dung Radix Dialog rieng, khac han giao dien "reactor" cua modal Tao
// workspace.
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
  const [visibility, setVisibility] = useState<ApiKnowledgeGroupVisibility>("PRIVATE");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function resetForm() {
    setName("");
    setDescription("");
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
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-medium transition-colors duration-150 ease-out"
        style={{ border: "1px dashed var(--border)", color: "var(--ink-faint)" }}
      >
        <Plus size={15} strokeWidth={2.25} />
        Tạo nhóm kiến thức
      </button>

      <TransformModal
        open={open}
        onClose={() => {
          setOpen(false);
          resetForm();
        }}
        title="Tạo nhóm kiến thức mới"
        description="1 nhóm kiến thức gom cac bai viet cung chu de trong workspace nay."
        footer={null}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <ModalFieldLabel htmlFor="group-name">Tên nhóm</ModalFieldLabel>
            <ModalInput
              id="group-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: React nâng cao"
            />
          </div>

          <div className="flex flex-col gap-1">
            <ModalFieldLabel htmlFor="group-description">Mô tả (tùy chọn)</ModalFieldLabel>
            <ModalTextarea
              id="group-description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-300">Quyền xem</span>
            <ModalSegmentedToggle
              value={visibility}
              onChange={setVisibility}
              options={[
                { value: "PUBLIC", label: "Công khai" },
                { value: "PRIVATE", label: "Riêng tư" },
              ]}
            />
            <ModalHint>
              {visibility === "PUBLIC"
                ? "Ai cũng xem được bài đã xuất bản trong nhóm."
                : "Chỉ bạn và cộng tác viên được duyệt mới xem được."}{" "}
              Quyền viết bài luôn cần được duyệt, bất kể lựa chọn này.
            </ModalHint>
          </div>

          {error && <ModalErrorText>{error}</ModalErrorText>}

          <ModalSubmitButton disabled={isPending}>
            {isPending ? "Đang tạo..." : "Tạo nhóm"}
          </ModalSubmitButton>
        </form>
      </TransformModal>
    </>
  );
}
