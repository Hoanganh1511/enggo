"use client";

import { useEffect, useRef, useState } from "react";
import { DocsMarkdown } from "@/components/docs/DocsMarkdown";
import { RegionGlobeModal, type RegionGlobePoint } from "@/components/compose/RegionGlobeModal";

// Boc DocsMarkdown (than bai Entry) trong 1 click handler UY QUYEN
// (delegated) - StatAccordion (post-extensions.ts) render ra HTML THO thuan
// (khong co JS/React nao chay, xem comment StatAccordion) nen KHONG the gan
// onClick truc tiep tung dong luc render. React van nhan duoc click bubble
// len tu noi dung dangerouslySetInnerHTML (day la DOM that, bubble binh
// thuong bat ke duoc tao ra the nao) nen chi can 1 onClick DUY NHAT o day,
// kiem tra .stat-accordion-item-clickable nao vua duoc bam qua closest().
export function EntryContentWithGlobe({ markdown }: { markdown: string }) {
  const [focus, setFocus] = useState<RegionGlobePoint | null>(null);
  const [points, setPoints] = useState<RegionGlobePoint[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);

  // [2026-09-16] Gan thuoc tinh HTML "name" CHUNG cho cac <details> LA SIBLING
  // THAT (chung 1 the cha) - trinh duyet native se tu DONG CHI CHO 1 the
  // trong nhom do MO tai 1 thoi diem (dung dac ta HTML5 vi <details name>,
  // KHONG can JS toggle tu tay) - yeu cau nguoi dung: "chỉ được mở 1 cái cùng
  // cấp vào 1 thời điểm" (truoc do "Geographic Regions" VA "Edge Locations"
  // - 2 StatAccordion cung nam trong body cua Accordion "North America" -
  // deu duoc luu voi `open` rieng nen cung mo het cung luc, khong lien quan
  // gi nhau). Nhom theo `parentElement` THAT (khong doan qua ten/id) de dung
  // "cung cap" bat ke Accordion thuong hay Accordion Geographical (StatAccordion)
  // tron lan nhau trong 1 body. Chay lai moi khi `markdown` doi (Live preview
  // go lai noi dung) qua useEffect thuong - KHONG the lam tinh (ket qua phu
  // thuoc DOM THAT sau khi rehype-raw dung xong, khong doan truoc duoc luc
  // render).
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const items = Array.from(
      root.querySelectorAll<HTMLDetailsElement>("details.accordion-block, details.stat-accordion"),
    );
    const groups = new Map<Element | null, HTMLDetailsElement[]>();
    for (const el of items) {
      const list = groups.get(el.parentElement) ?? [];
      list.push(el);
      groups.set(el.parentElement, list);
    }
    let groupIndex = 0;
    groups.forEach((siblings) => {
      if (siblings.length < 2) return;
      const name = `accordion-group-${groupIndex++}`;
      let keptOpen = false;
      siblings.forEach((el) => {
        el.setAttribute("name", name);
        // Du lieu cu co the luu NHIEU sibling cung `open` (chinh bug nguoi
        // dung bao) - gan `name` KHONG tu dong dong bot cai da mo san (chi
        // chan mo THEM tu luc nay), nen phai tu tay chi giu MO cai DAU TIEN.
        if (el.open) {
          if (keptOpen) el.open = false;
          else keptOpen = true;
        }
      });
    });
  }, [markdown]);

  // Yeu cau nguoi dung: "hiển thị tất cả tọa độ có trong accordion
  // geographic" - khong chi bam 1 dong la chi hien DUY NHAT dong do, ma quet
  // CA khoi ".stat-accordion-list" (chinh Accordion Geographical chua dong
  // vua bam) de lay HET cac dong co toa do lam `points` (hien dang dot tren
  // globe), rieng dong vua bam la `focus` (dot highlight + camera bay toi).
  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const item = (e.target as HTMLElement).closest<HTMLElement>(".stat-accordion-item-clickable[data-lat]");
    if (!item) return;
    const lat = Number(item.dataset.lat);
    const lng = Number(item.dataset.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    const label = item.querySelector(".stat-accordion-item-text")?.textContent?.trim() ?? "";

    const list = item.closest<HTMLElement>(".stat-accordion-list");
    const siblings = list
      ? Array.from(list.querySelectorAll<HTMLElement>(".stat-accordion-item-clickable[data-lat]"))
      : [item];
    const collected: RegionGlobePoint[] = siblings
      .map((el) => ({
        label: el.querySelector(".stat-accordion-item-text")?.textContent?.trim() ?? "",
        lat: Number(el.dataset.lat),
        lng: Number(el.dataset.lng),
      }))
      .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));

    setPoints(collected);
    setFocus({ label, lat, lng });
  }

  return (
    <div ref={rootRef} onClick={handleClick}>
      <DocsMarkdown markdown={markdown} />
      <RegionGlobeModal focus={focus} points={points} onOpenChange={(open) => !open && setFocus(null)} />
    </div>
  );
}
