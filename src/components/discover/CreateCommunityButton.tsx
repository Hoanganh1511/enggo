"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createCommunityAction } from "@/actions/community/create-community";
import { ApiError } from "@/lib/api/client";

// "đ"/"Đ" khong tach duoc qua NFD normalize (la 1 chu cai rieng cua tieng
// Viet, khong phai "d" + dau) nen phai thay tay truoc khi bo dau cac chu con
// lai.
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

// Nut "Tao cong dong" + modal form di kem (tu chua ca 2 trong 1 component -
// trang /communities la Server Component nen khong the giu state "open" o
// do, phai gop trigger+modal vao 1 client component roi tha thang vao JSX).
export function CreateCommunityButton() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function resetForm() {
    setName("");
    setSlug("");
    setSlugTouched(false);
    setDescription("");
    setIsPublic(true);
    setError(null);
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
        const community = await createCommunityAction({
          name,
          slug,
          description,
          isPublic,
        });
        setOpen(false);
        resetForm();
        router.push(`/communities/${community.slug}`);
      } catch (e) {
        if (e instanceof ApiError && e.status === 409) {
          setError("Slug này đã được sử dụng, hãy chọn slug khác.");
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
          className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-md bg-community-accent px-4 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-community-accent-hover"
        >
          <Plus size={15} strokeWidth={2.25} />
          Tạo cộng đồng
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay" />
        <Dialog.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-3rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-white p-5 shadow-xl focus:outline-none"
        >
          <div className="mb-4 flex items-start justify-between gap-2">
            <div>
              <Dialog.Title className="text-base font-bold text-ink">
                Tạo cộng đồng mới
              </Dialog.Title>
              <Dialog.Description className="mt-0.5 text-xs text-ink-faint">
                Bạn sẽ là chủ sở hữu của cộng đồng này.
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
              <label htmlFor="community-name" className="text-xs font-semibold text-ink">
                Tên cộng đồng
              </label>
              <input
                id="community-name"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="VD: Cộng đồng React Việt Nam"
                className="h-9 rounded-md border border-border px-3 text-sm outline-none focus:border-community-accent"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="community-slug" className="text-xs font-semibold text-ink">
                Slug (đường dẫn)
              </label>
              <div className="flex items-center gap-1.5">
                <span className="shrink-0 text-xs text-ink-faint">
                  /communities/
                </span>
                <input
                  id="community-slug"
                  required
                  pattern="[a-z0-9-]+"
                  title="Chỉ gồm chữ thường, số và dấu gạch ngang"
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(e.target.value);
                  }}
                  className="h-9 min-w-0 flex-1 rounded-md border border-border px-3 text-sm outline-none focus:border-community-accent"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="community-description" className="text-xs font-semibold text-ink">
                Mô tả
              </label>
              <textarea
                id="community-description"
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Cộng đồng này dành cho ai, trao đổi về điều gì?"
                className="resize-none rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-community-accent"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-ink">Quyền riêng tư</span>
              <div className="flex items-center gap-1 rounded-md border border-border p-1">
                <button
                  type="button"
                  onClick={() => setIsPublic(true)}
                  className={cn(
                    "h-8 flex-1 cursor-pointer rounded-sm text-xs font-semibold transition-colors duration-150 ease-out",
                    isPublic
                      ? "bg-community-accent text-white"
                      : "text-ink-muted hover:bg-hover-bg",
                  )}
                >
                  Công khai
                </button>
                <button
                  type="button"
                  onClick={() => setIsPublic(false)}
                  className={cn(
                    "h-8 flex-1 cursor-pointer rounded-sm text-xs font-semibold transition-colors duration-150 ease-out",
                    !isPublic
                      ? "bg-community-accent text-white"
                      : "text-ink-muted hover:bg-hover-bg",
                  )}
                >
                  Riêng tư
                </button>
              </div>
              <p className="text-[11px] text-ink-faint">
                {isPublic
                  ? "Ai cũng xem được và tham gia ngay lập tức."
                  : "Người tham gia cần được duyệt yêu cầu trước."}
              </p>
            </div>

            {error && <p className="text-xs font-medium text-danger">{error}</p>}

            <button
              type="submit"
              disabled={isPending}
              className="mt-1 h-9 cursor-pointer rounded-md bg-community-accent text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-community-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Đang tạo..." : "Tạo cộng đồng"}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
