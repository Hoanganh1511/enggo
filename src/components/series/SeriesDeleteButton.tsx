"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast/toast-store";
import { getApiErrorMessage } from "@/lib/api/client";
import { deleteContentSeriesAction } from "@/actions/discover/content-series/delete-content-series";

export function SeriesDeleteButton({ seriesSlug }: { seriesSlug: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm("Xoá vĩnh viễn Series này và toàn bộ nội dung bên trong?")) return;
    setDeleting(true);
    try {
      await deleteContentSeriesAction(seriesSlug);
      toast.success("Đã xoá Series");
      router.push("/series");
    } catch (err) {
      toast.danger(getApiErrorMessage(err, "Xoá thất bại, thử lại sau."));
      setDeleting(false);
    }
  }

  return (
    <button
      type="button"
      disabled={deleting}
      onClick={handleDelete}
      className="cursor-pointer rounded-lg border border-danger px-4 py-2 text-[13px] font-semibold text-danger transition hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {deleting ? "Đang xoá..." : "Xoá Series này"}
    </button>
  );
}
