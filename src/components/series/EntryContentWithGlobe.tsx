"use client";

import { useState } from "react";
import { DocsMarkdown } from "@/components/docs/DocsMarkdown";
import { RegionGlobeModal, type RegionGlobeTarget } from "@/components/compose/RegionGlobeModal";

// Boc DocsMarkdown (than bai Entry) trong 1 click handler UY QUYEN
// (delegated) - StatAccordion (post-extensions.ts) render ra HTML THO thuan
// (khong co JS/React nao chay, xem comment StatAccordion) nen KHONG the gan
// onClick truc tiep tung dong luc render. React van nhan duoc click bubble
// len tu noi dung dangerouslySetInnerHTML (day la DOM that, bubble binh
// thuong bat ke duoc tao ra the nao) nen chi can 1 onClick DUY NHAT o day,
// kiem tra .stat-accordion-item-clickable nao vua duoc bam qua closest().
export function EntryContentWithGlobe({ markdown }: { markdown: string }) {
  const [target, setTarget] = useState<RegionGlobeTarget | null>(null);

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const item = (e.target as HTMLElement).closest<HTMLElement>(".stat-accordion-item-clickable[data-lat]");
    if (!item) return;
    const lat = Number(item.dataset.lat);
    const lng = Number(item.dataset.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    const label = item.querySelector(".stat-accordion-item-text")?.textContent?.trim() ?? "";
    setTarget({ label, lat, lng });
  }

  return (
    <div onClick={handleClick}>
      <DocsMarkdown markdown={markdown} />
      <RegionGlobeModal target={target} onOpenChange={(open) => !open && setTarget(null)} />
    </div>
  );
}
