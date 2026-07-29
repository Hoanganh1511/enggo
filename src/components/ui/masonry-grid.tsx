"use client";

import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";

// Luoi masonry ("waterfall" kieu Pinterest): cot RONG CO DINH, item cao khac
// nhau, moi item roi vao cot dang THAP NHAT de triet tieu khoang trong doc.
//
// Vi sao khong dung CSS thuan:
// - `column-count` do noi dung DOC truoc roi moi sang phai -> thu tu doc sai
//   han voi feed (bai 2 nam duoi bai 1 chu khong phai ben canh).
// - `grid-template-rows: masonry` dung ngu nghia nhat nhung ho tro trinh duyet
//   con han che, chua dung duoc cho production.
// Nen vi tri phai TINH BANG JS roi dat tuyet doi - dung cach cac thu vien
// masonry that (Gestalt cua Pinterest) dang lam.
//
// Khac Pinterest 1 diem: ho biet truoc ti le anh tu metadata nen tinh duoc
// chieu cao TRUOC khi render. Post o day chu yeu la CHU (do dai bat ky) nen
// bat buoc phai co buoc DO that bang ResizeObserver. Doi lai duoc mien phi:
// anh load xong / doi font / doi kich thuoc cua so deu tu dong xep lai.

type MasonryGridProps<T> = {
  items: T[];
  // Nen la ham on dinh (khai bao ngoai component) de khoi tinh lai layout thua.
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  // Be ngang toi thieu cua 1 cot - so cot suy ra tu day + be ngang container.
  minColumnWidth?: number;
  gap?: number;
};

export function MasonryGrid<T>({
  items,
  getKey,
  renderItem,
  minColumnWidth = 320,
  gap = 16,
}: MasonryGridProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [heights, setHeights] = useState<Record<string, number>>({});

  const observerRef = useRef<ResizeObserver | null>(null);
  const keyByElement = useRef(new Map<Element, string>());

  // Tao lazy: ref callback cua item chay TRUOC useLayoutEffect nen khong the
  // khoi tao observer trong effect duoc.
  const getItemObserver = () => {
    if (!observerRef.current) {
      observerRef.current = new ResizeObserver((entries) => {
        setHeights((prev) => {
          let changed = false;
          const next = { ...prev };
          for (const entry of entries) {
            const key = keyByElement.current.get(entry.target);
            if (!key) continue;
            const h =
              entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
            if (next[key] !== h) {
              next[key] = h;
              changed = true;
            }
          }
          return changed ? next : prev;
        });
      });
    }
    return observerRef.current;
  };

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, []);

  // Thuat toan cot ngan nhat - 1 luot, O(n * soCot).
  const layout = useMemo(() => {
    if (containerWidth === 0) {
      return { positions: new Map<string, { x: number; y: number }>(), columnWidth: 0, height: 0 };
    }
    const columnCount = Math.max(
      1,
      Math.floor((containerWidth + gap) / (minColumnWidth + gap)),
    );
    const columnWidth = (containerWidth - gap * (columnCount - 1)) / columnCount;
    const columnHeights = new Array<number>(columnCount).fill(0);
    const positions = new Map<string, { x: number; y: number }>();

    for (const item of items) {
      const key = getKey(item);
      let shortest = 0;
      for (let i = 1; i < columnCount; i++) {
        if (columnHeights[i] < columnHeights[shortest]) shortest = i;
      }
      positions.set(key, {
        x: shortest * (columnWidth + gap),
        y: columnHeights[shortest],
      });
      columnHeights[shortest] += (heights[key] ?? 0) + gap;
    }

    return {
      positions,
      columnWidth,
      height: Math.max(...columnHeights) - gap,
    };
  }, [containerWidth, heights, items, getKey, gap, minColumnWidth]);

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height: layout.height > 0 ? layout.height : undefined }}
    >
      {/* Chua do xong be ngang container thi chua render item nao - tranh do
          chieu cao o be ngang sai roi phai xep lai. Chi ton 1 frame. */}
      {containerWidth > 0 &&
        items.map((item) => {
          const key = getKey(item);
          const pos = layout.positions.get(key);
          const isMeasured = heights[key] !== undefined;

          return (
            <div
              key={key}
              ref={(el) => {
                if (!el) return;
                const ro = getItemObserver();
                keyByElement.current.set(el, key);
                ro.observe(el);
                // React 19: cleanup tra ve tu ref callback, chay luc unmount.
                return () => {
                  ro.unobserve(el);
                  keyByElement.current.delete(el);
                };
              }}
              className="absolute top-0 left-0 transition-opacity duration-200 ease-out"
              style={{
                width: layout.columnWidth,
                // translate3d thay vi top/left: chay tren compositor, khong
                // gay reflow moi lan xep lai.
                transform: `translate3d(${pos?.x ?? 0}px, ${pos?.y ?? 0}px, 0)`,
                // An cho toi khi do xong, neu khong moi item se nhap nhay o
                // (0,0) truoc khi vao dung cho.
                opacity: isMeasured ? 1 : 0,
              }}
            >
              {renderItem(item)}
            </div>
          );
        })}
    </div>
  );
}

export default MasonryGrid;
