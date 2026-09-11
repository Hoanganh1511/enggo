"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { CreateCollectionModal } from "./CreateCollectionModal";
import type { PostCollectionApiShape } from "@/lib/api/collections";

// Nut "Chỉnh sửa" tren collections/[id]/page.tsx (Server Component) - tach
// rieng thanh 1 client island GON de page.tsx khong phai "use client" ca
// trang chi vi 1 nut. Dung lai CHINH CreateCollectionModal (mode="edit") -
// sau khi luu thanh cong goi router.refresh() de page.tsx (Server Component)
// fetch lai du lieu moi nhat (title/mo ta/anh bia/stat), khong can tu quan
// state hien thi rieng o day.
export function EditCollectionButton({
  collection,
}: {
  collection: PostCollectionApiShape;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-[var(--border)] px-3.5 text-sm font-semibold text-[var(--foreground)] transition-colors duration-150 ease-out hover:bg-[var(--surface-subtle)]"
      >
        <Pencil size={14} strokeWidth={2} />
        Chỉnh sửa
      </button>
      <CreateCollectionModal
        open={open}
        onOpenChange={setOpen}
        mode="edit"
        collection={collection}
        onCreated={() => router.refresh()}
      />
    </>
  );
}
