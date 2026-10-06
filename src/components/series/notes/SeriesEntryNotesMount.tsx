"use client";

import { useEffect } from "react";
import { useNotesStore } from "@/stores/notes-store";
import { ArticleSelectionToolbar } from "./ArticleSelectionToolbar";
import { ArticleNoteMarkers } from "./ArticleNoteMarkers";

// Dang ky ngu canh (seriesSlug/entryId/entrySlug) cho notes-store.ts NGAY KHI
// vao 1 Entry cu the - SeriesNotesLauncher.tsx (mount o layout.tsx, dung
// chung Overview+moi Entry) KHONG tu biet dang o Entry nao, phai doi "bao"
// tu chinh trang Entry ([entrySlug]/page.tsx). Dong thoi mount 2 thanh phan
// chi co y nghia O MOT Entry cu the: floating toolbar (bo den text) + marker
// le (danh dau vi tri cac note da co).
export function SeriesEntryNotesMount({
  seriesSlug,
  entryId,
  entrySlug,
}: {
  seriesSlug: string;
  entryId: string;
  entrySlug: string;
}) {
  const setContext = useNotesStore((s) => s.setContext);

  useEffect(() => {
    setContext({ seriesSlug, entryId, entrySlug });
    return () => setContext(null);
  }, [seriesSlug, entryId, entrySlug, setContext]);

  return (
    <>
      <ArticleSelectionToolbar />
      <ArticleNoteMarkers entryId={entryId} />
    </>
  );
}
