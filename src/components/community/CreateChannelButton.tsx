"use client";

import { useState, useTransition } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Check, Plus, X } from "lucide-react";
import { createChannelAction } from "@/actions/community/create-channel";
import { ApiError } from "@/lib/api/client";

function slugify(input: string): string {
  return input
    .replace(/đ/gi, "d")
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Nut "+ Tao kenh" trong sidebar Member - AI CUNG THAY va bam duoc (khong
// rieng owner/admin). Backend tu quyet dinh trang thai: owner/admin tao ->
// hien ngay; thanh vien thuong tao -> PENDING, cho quan tri duyet o
// CommunityChannelRequestsPanel.tsx.
export function CreateChannelButton({
  communityId,
  communitySlug,
  isModerator,
}: {
  communityId: string;
  communitySlug: string;
  isModerator: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  function resetForm() {
    setName("");
    setSlug("");
    setSlugTouched(false);
    setDescription("");
    setError(null);
    setSubmitted(false);
  }

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await createChannelAction(communityId, communitySlug, {
          slug,
          name,
          description,
          group: "knowledge",
        });
        if (isModerator) {
          setOpen(false);
          resetForm();
        } else {
          setSubmitted(true);
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 409) {
          setError("Slug kênh này đã tồn tại, hãy chọn slug khác.");
        } else {
          setError("Có lỗi xảy ra, thử lại sau.");
        }
      }
    });
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetForm();
      }}
    >
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm text-community-accent transition-colors duration-150 ease-out hover:bg-hover-bg"
        >
          <Plus size={15} strokeWidth={2.25} />
          Tạo kênh
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay" />
        <Dialog.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-3rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-white p-5 shadow-xl focus:outline-none"
        >
          {submitted ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <span className="flex size-11 items-center justify-center rounded-full bg-community-accent/10 text-community-accent">
                <Check size={22} strokeWidth={2.25} />
              </span>
              <div>
                <Dialog.Title className="text-sm font-bold text-ink">
                  Đã gửi yêu cầu tạo kênh
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-xs text-ink-faint">
                  Kênh &quot;{name}&quot; đang chờ quản trị viên duyệt.
                </Dialog.Description>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mt-1 h-8 cursor-pointer rounded-md border border-border px-4 text-xs font-semibold text-ink hover:bg-hover-bg"
              >
                Đóng
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-start justify-between gap-2">
                <div>
                  <Dialog.Title className="text-base font-bold text-ink">
                    Tạo kênh mới
                  </Dialog.Title>
                  <Dialog.Description className="mt-0.5 text-xs text-ink-faint">
                    {isModerator
                      ? "Kênh sẽ hiện ngay trong danh sách."
                      : "Kênh cần được quản trị viên duyệt trước khi hiện ra."}
                  </Dialog.Description>
                </div>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    aria-label="Đóng"
                    className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink-faint hover:bg-hover-bg hover:text-ink"
                  >
                    <X size={16} strokeWidth={2} />
                  </button>
                </Dialog.Close>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="channel-name" className="text-xs font-semibold text-ink">
                    Tên kênh
                  </label>
                  <input
                    id="channel-name"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="VD: hỏi-đáp"
                    className="h-9 rounded-md border border-border px-3 text-sm outline-none focus:border-community-accent"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="channel-slug" className="text-xs font-semibold text-ink">
                    Slug
                  </label>
                  <input
                    id="channel-slug"
                    required
                    pattern="[a-z0-9-]+"
                    title="Chỉ gồm chữ thường, số và dấu gạch ngang"
                    value={slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setSlug(e.target.value);
                    }}
                    className="h-9 rounded-md border border-border px-3 text-sm outline-none focus:border-community-accent"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="channel-description"
                    className="text-xs font-semibold text-ink"
                  >
                    Mô tả
                  </label>
                  <textarea
                    id="channel-description"
                    required
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Kênh này dùng để trao đổi về điều gì?"
                    className="resize-none rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-community-accent"
                  />
                </div>

                {error && (
                  <p className="text-xs font-medium text-danger">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isPending}
                  className="mt-1 h-9 cursor-pointer rounded-md bg-community-accent text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-community-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending
                    ? "Đang gửi..."
                    : isModerator
                      ? "Tạo kênh"
                      : "Gửi yêu cầu"}
                </button>
              </form>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
