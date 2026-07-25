"use client";

import { useState, useTransition } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus } from "lucide-react";
import { createCategoryAction } from "@/actions/career-tree/create-category";
import Spinner from "@/components/ui/spinner";

type CreateCategoryModalProps = {
  workspaceId: string;
  // Toolbar tong quan Knowledge Blocks goi la "+ Knowledge Block" (cung 1
  // modal, chi doi nhan hien thi - Category VAN la model that ben duoi).
  label?: string;
};

// "+ Category" that su - moi Category la 1 khoi rieng ben trai canvas, so
// huu bo Tier cua rieng no. Hoi them "description" (hien trong Knowledge
// Block Summary o trang tong quan) - icon/color trong schema van de tuy
// chon/danh cho sau, chua can UI chon ngay.
const CreateCategoryModal = ({
  workspaceId,
  label = "Category",
}: CreateCategoryModalProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    startTransition(async () => {
      await createCategoryAction(
        workspaceId,
        trimmed,
        description.trim() || undefined,
      );
      setName("");
      setDescription("");
      setOpen(false);
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-border px-2.5 text-sm font-medium text-ink transition-colors duration-150 ease-out hover:bg-hover-bg"
        >
          <Plus size={14} strokeWidth={2} />
          {label}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay" />
        <Dialog.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-3rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface p-6 shadow-panel focus:outline-none"
        >
          <Dialog.Title className="text-base font-medium text-ink">
            Tạo {label} mới
          </Dialog.Title>
          <p className="mt-1 text-sm text-ink-muted">
            {label} chứa bộ Tier riêng - vd &ldquo;Frontend&rdquo;,
            &ldquo;Backend&rdquo;, &ldquo;DevOps&rdquo;.
          </p>

          <div className="mt-4 flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-muted">
                Tên {label}
              </label>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="VD: Frontend"
                className="h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm text-ink placeholder:text-ink-faint focus:border-focus-border focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-muted">
                Mô tả (tuỳ chọn)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="VD: React/Next.js, styling, hiệu năng, kiểm thử."
                rows={2}
                className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-focus-border focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Dialog.Close asChild>
              <button
                type="button"
                className="cursor-pointer rounded-lg px-3 py-1.5 text-sm text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg"
              >
                Huỷ
              </button>
            </Dialog.Close>
            <button
              type="button"
              disabled={!name.trim() || isPending}
              onClick={handleSubmit}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm text-white transition-colors duration-150 ease-out hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending && <Spinner size={13} className="text-white" />}
              Tạo {label}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CreateCategoryModal;
