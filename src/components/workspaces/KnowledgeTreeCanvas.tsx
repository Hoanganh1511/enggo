"use client";

import { useMemo, useState } from "react";
import { Lock } from "lucide-react";
import type { ApiKnowledgeGroup } from "@/lib/api/types";
import { colorOf } from "./node-color";

// "Cay tri thuc" - ban thay the moi cho KnowledgeUniverseCanvas.tsx cu (da bo
// khoi UI tu lau). Khac ban cu ve CA y nghia lan hinh thuc:
//   - Y nghia: moi nhanh la 1 Knowledge Group, ĐỘ NỞ cua nhanh (be day net +
//     kich thuoc hoa) phan anh % checklist "đã hieu" GOP tu toan bo bai viet
//     trong nhom (Document.checklistTotal/checklistUnderstood, xem
//     WorkspaceService.listByOwnerWithGroups) - tin hieu THAT, khong phai
//     trang tri. Ban cu chi la "tai lieu bay quanh quy dao", khong mang y
//     nghia tang truong gi.
//   - Hinh thuc: dung TOKEN CSS (var(--surface)/var(--border-strong)/
//     var(--shadow-dropdown)...) thay vi mau "vu tru" hardcode (#070b16,
//     cyan-300/20...) - dung nguyen tac da chot trong
//     docs/workspace-style-guide.md (kieu nen toi co dinh CHI danh cho
//     WorkspaceGatewayOverlay.tsx, khong phai man duyet noi dung chinh).
//   - Bo han pan/zoom imperative cua ban cu - so luong nhanh trong 1
//     workspace nho (thuong <10), khong can; giu component don gian/de bao
//     tri hon la sao chep lai toan bo co che ticker rieng khong thuc su can.
// Click 1 nhanh goi thang onSelectGroup - DUNG chung selectGroup cua
// WorkspaceShellContext, khong tao state chon rieng song song voi sidebar.
const SPREAD_DEG = 130;
const MIN_LENGTH = 62;
const MAX_LENGTH = 104;
const MIN_BLOOM = 7;
const MAX_BLOOM = 15;

type TreeGroup = ApiKnowledgeGroup & { growth: number; angleRad: number; x: number; y: number };

export function KnowledgeTreeCanvas({
  groups,
  selectedGroupId,
  onSelectGroup,
}: {
  groups: ApiKnowledgeGroup[];
  selectedGroupId: string | null;
  onSelectGroup: (g: ApiKnowledgeGroup) => void;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const width = 900;
  const height = 210;
  const baseX = width / 2;
  const baseY = height - 6;
  const branchY = height * 0.6;

  const branches = useMemo<TreeGroup[]>(() => {
    const n = groups.length;
    return groups.map((g, i) => {
      const total = g.checklistTotal ?? 0;
      const understood = g.checklistUnderstood ?? 0;
      const growth = total > 0 ? understood / total : 0;
      const angleDeg =
        n === 1 ? 0 : -SPREAD_DEG / 2 + (SPREAD_DEG / (n - 1)) * i;
      const angleRad = ((angleDeg - 90) * Math.PI) / 180;
      const length = MIN_LENGTH + growth * (MAX_LENGTH - MIN_LENGTH);
      return {
        ...g,
        growth,
        angleRad,
        x: baseX + Math.cos(angleRad) * length,
        y: branchY + Math.sin(angleRad) * length,
      };
    });
  }, [groups, baseX, branchY]);

  const hovered = branches.find((b) => b.id === hoveredId) ?? null;

  if (groups.length === 0) return null;

  return (
    <div
      className="relative w-full overflow-hidden rounded-[13px]"
      style={{
        border: "1px solid var(--border)",
        background:
          "linear-gradient(180deg, var(--surface-muted), var(--surface))",
      }}
    >
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[190px] w-full">
        {/* Dat trong noi than moc len - tinh, khong dong bo trai qua nhieu
            man hinh, chi bao hieu "goc re". */}
        <line
          x1={0}
          y1={baseY + 3}
          x2={width}
          y2={baseY + 3}
          stroke="var(--border)"
          strokeWidth={1}
        />
        {/* Than cay */}
        <line
          x1={baseX}
          y1={baseY}
          x2={baseX}
          y2={branchY}
          stroke="var(--ink-faint)"
          strokeWidth={4}
          strokeLinecap="round"
        />

        {branches.map((b) => {
          const color = colorOf(b.id);
          const dormant = b.checklistTotal === 0 || !b.checklistTotal;
          const isSelected = b.id === selectedGroupId;
          const bloomR = MIN_BLOOM + b.growth * (MAX_BLOOM - MIN_BLOOM);
          const locked = b.visibility === "PRIVATE" && !b.viewerCanWrite;

          return (
            <g
              key={b.id}
              onPointerEnter={() => setHoveredId(b.id)}
              onPointerLeave={() => setHoveredId((id) => (id === b.id ? null : id))}
              onClick={() => onSelectGroup(b)}
              style={{ cursor: "pointer" }}
            >
              {/* Canh */}
              <path
                d={`M ${baseX} ${branchY} Q ${(baseX + b.x) / 2} ${branchY - 10} ${b.x} ${b.y}`}
                fill="none"
                stroke={color}
                strokeWidth={dormant ? 2 : 2 + b.growth * 3}
                strokeLinecap="round"
                opacity={dormant ? 0.35 : 0.75}
              />
              {/* Vong chon */}
              {isSelected && (
                <circle
                  cx={b.x}
                  cy={b.y}
                  r={bloomR + 6}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth={1.5}
                />
              )}
              {/* Hoa/no theo % da hieu - dormant (chua co muc checklist nao)
                  thi chi la 1 nu tron nho, mo. */}
              <circle
                cx={b.x}
                cy={b.y}
                r={dormant ? 5 : bloomR}
                fill={color}
                opacity={dormant ? 0.3 : 0.92}
              />
              {!dormant && (
                <circle cx={b.x} cy={b.y} r={bloomR * 0.4} fill="#ffffff" opacity={0.28} />
              )}
              {locked && (
                <g transform={`translate(${b.x + bloomR * 0.55} ${b.y - bloomR * 0.55})`}>
                  <circle r={7} fill="var(--surface)" stroke="var(--border-strong)" strokeWidth={1} />
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Icon khoa THAT (lucide, khong ve tay trong SVG) - dat de len tren
          dung vi tri hoa cua nhanh bi khoa, tinh bang % toa do SVG quy sang
          container thuc te. */}
      {branches
        .filter((b) => b.visibility === "PRIVATE" && !b.viewerCanWrite)
        .map((b) => (
          <div
            key={`lock-${b.id}`}
            className="pointer-events-none absolute flex size-3.5 items-center justify-center"
            style={{
              left: `${(b.x / width) * 100}%`,
              top: `${((b.y - 8) / height) * 84}%`,
              color: "var(--ink-faint)",
            }}
          >
            <Lock size={9} strokeWidth={2.2} />
          </div>
        ))}

      {/* Nhan ten nhom - HTML thuong (khong phai SVG text) de dung font/token
          nhat quan voi phan con lai cua app, de truncate hon. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[190px]">
        {branches.map((b) => (
          <div
            key={`label-${b.id}`}
            className="absolute max-w-[110px] -translate-x-1/2 truncate text-center text-[10px] font-medium"
            style={{
              left: `${(b.x / width) * 100}%`,
              top: `${(b.y / height) * 90 + 8}%`,
              color: b.id === selectedGroupId ? "var(--primary)" : "var(--ink-muted)",
            }}
          >
            {b.name}
          </div>
        ))}
      </div>

      {hovered && (
        <div
          className="pointer-events-none absolute top-2 left-1/2 -translate-x-1/2 rounded-lg px-3 py-2 text-center"
          style={{
            background: "var(--surface-raised)",
            border: "1px solid var(--border-strong)",
            boxShadow: "var(--shadow-dropdown)",
          }}
        >
          <div className="text-[12px] font-semibold" style={{ color: "var(--ink)" }}>
            {hovered.name}
          </div>
          <div className="mt-0.5 text-[10px]" style={{ color: "var(--ink-faint)" }}>
            {hovered.checklistTotal
              ? `${hovered.checklistUnderstood}/${hovered.checklistTotal} đã hiểu · `
              : "Chưa có checklist · "}
            {hovered.postCount} bài viết
          </div>
        </div>
      )}
    </div>
  );
}
