"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createWorkspaceAction } from "@/actions/workspaces/create-workspace";
import TransformModal from "@/components/ui/transform-modal";
import {
  ModalErrorText,
  ModalFieldLabel,
  ModalInput,
  ModalSubmitButton,
  ModalTextarea,
} from "@/components/ui/modal-form";

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
    <TransformModal
      open={open}
      onClose={() => {
        onOpenChange(false);
        resetForm();
      }}
      title="Tạo workspace mới"
      description="Mỗi workspace là 1 vùng kiến thức riêng - đặt tên để bắt đầu."
      footer={null}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <ModalFieldLabel htmlFor="ws-name">Tên workspace</ModalFieldLabel>
          <ModalInput
            id="ws-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Học tập, Film"
          />
        </div>

        <div className="flex flex-col gap-1">
          <ModalFieldLabel htmlFor="ws-description">Mô tả (tùy chọn)</ModalFieldLabel>
          <ModalTextarea
            id="ws-description"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Workspace này dùng để lưu gì?"
          />
        </div>

        {error && <ModalErrorText>{error}</ModalErrorText>}

        <ModalSubmitButton disabled={isPending}>
          {isPending ? "Đang tạo..." : "Tạo workspace"}
        </ModalSubmitButton>
      </form>
    </TransformModal>
  );
}
