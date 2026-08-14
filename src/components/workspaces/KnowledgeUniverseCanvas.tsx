"use client";

import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { create } from "zustand";
import type { ApiDocumentSummary, ApiKnowledgeGroup } from "@/lib/api/types";
import { colorOf } from "./node-color";

// "Knowledge Map" - ban DOM/SVG (thay ban PixiJS/WebGL truoc day). Ly do
// doi: khi mo 1 bai viet, WorkspaceDetail can hub + tung "hanh tinh" (node
// tai lieu) THAT SU xoay theo quy dao rieng ve tam nhu 1 con loc/lo den roi
// moi nhuong cho ArticleFocusOverlay (xem KnowledgeUniverseCanvas cu +
// mainPhase trong WorkspaceDetail.tsx) - dieu nay khong lam duoc sach voi 1
// Pixi Application (vi tri node do 1 ticker rieng cua Pixi dieu khien tung
// frame, khong the giao cho Framer Motion dieu khien tung node). Ke ca neu
// giu Pixi va chi CSS-transform ca khoi <canvas>, hieu ung se chi la "ca
// buc tranh xoay/thu nho" (1 phep bien doi DUY NHAT cho ca khoi), khong
// phai tung hanh tinh tu xoay quy dao rieng - khac voi yeu cau. Doi sang
// DOM/SVG cho phep tung node la 1 <motion.g> dieu khien rieng, dong thoi
// nhe hon (khong con GPU context/Application rieng) - dung y "cho nhe" nguoi
// dung yeu cau.
//
// Giu NGUYEN props signature cu (group/docs/selectedDocId/onSelect) de la 1
// ban thay the truc tiep trong WorkspaceDetail.tsx - chi them 1 prop moi
// "phase" cho hieu ung dong/mo.
//
// Pan (keo chuot) + zoom (cuon chuot) van dung ky thuat CU: cap nhat
// transform cua <g> "world" TRUC TIEP qua ref trong 1 vong requestAnimationFrame
// (khong qua React state) - giong het cach ticker cua Pixi cu lam, tranh
// re-render React moi frame luc keo/cuon (se giat neu dung setState).

type HoveredInfo = { title: string; meta: string } | null;

type UniverseUiState = {
  hovered: HoveredInfo;
  setHovered: (h: HoveredInfo) => void;
};

const useUniverseUi = create<UniverseUiState>((set) => ({
  hovered: null,
  setHovered: (hovered) => set({ hovered }),
}));

const HUB_ID = "__hub__";
const HUB_COLOR = "#22d3ee";
const ORBIT_RADIUS = 150;
const MIN_ZOOM = 0.55;
const MAX_ZOOM = 2.8;

// Thoi luong dong/mo hieu ung xoay - WorkspaceDetail.tsx dung CHUNG hang so
// nay (import) de doi thoi diem thuc su mount/unmount ArticleFocusOverlay
// khop dung voi luc hieu ung xoay tren man hinh nay ket thuc.
export const MAP_TRANSITION_MS = 560;
const SPIRAL_STEPS = 8;
const EXTRA_TURNS = 1.7;

type ScenePhase = "idle" | "closing" | "opening";

type SceneNode = {
  id: string;
  title: string;
  meta: string;
  isHub: boolean;
  size: number;
  x: number;
  y: number;
  color: string;
};

function buildScene(
  group: ApiKnowledgeGroup,
  docs: ApiDocumentSummary[],
): SceneNode[] {
  const shown = docs.slice(0, 10);
  const nodes: SceneNode[] = [
    {
      id: HUB_ID,
      title: group.name,
      meta: `${group.postCount} bài viết`,
      isHub: true,
      size: 34,
      x: 0,
      y: 0,
      color: HUB_COLOR,
    },
  ];
  shown.forEach((doc, i) => {
    const angle = ((-90 + (360 / shown.length) * i) * Math.PI) / 180;
    nodes.push({
      id: doc.id,
      title: doc.title,
      meta: `${doc.viewCount} lượt xem`,
      isHub: false,
      size: 12,
      x: Math.cos(angle) * ORBIT_RADIUS,
      y: Math.sin(angle) * ORBIT_RADIUS,
      color: colorOf(doc.id),
    });
  });
  return nodes;
}

// Sinh mang keyframe x/y/opacity de 1 node "xoay ốc" ve tam (closing) hoac
// tu tam xoay ra vi tri thuong (opening) - tung node dung GOC BAN DAU cua
// chinh no nen duong xoay khac nhau giua cac node (khong phai 1 phep bien
// doi chung cho ca nhom).
function spiralKeyframes(node: SceneNode, direction: "closing" | "opening") {
  if (node.isHub) {
    return direction === "closing"
      ? { x: [0, 0], y: [0, 0], opacity: [1, 0], scale: [1, 0.25] }
      : { x: [0, 0], y: [0, 0], opacity: [0, 1], scale: [0.25, 1] };
  }
  const baseAngle = Math.atan2(node.y, node.x);
  const baseRadius = Math.hypot(node.x, node.y);
  const xs: number[] = [];
  const ys: number[] = [];
  const opacities: number[] = [];
  for (let i = 0; i <= SPIRAL_STEPS; i++) {
    const t = i / SPIRAL_STEPS;
    // closing: t=0 -> vi tri thuong, t=1 -> tam. opening: dao nguoc (i=0 ->
    // tam, i=STEPS -> vi tri thuong) de Framer phat mang keyframe THEO DUNG
    // huong tu tam ra ngoai.
    const tt = direction === "closing" ? t : 1 - t;
    const angle = baseAngle + tt * EXTRA_TURNS * Math.PI * 2;
    const radius = baseRadius * (1 - tt);
    xs.push(Math.cos(angle) * radius);
    ys.push(Math.sin(angle) * radius);
    opacities.push(1 - tt);
  }
  return { x: xs, y: ys, opacity: opacities };
}

const KEYFRAME_TIMES = Array.from(
  { length: SPIRAL_STEPS + 1 },
  (_, i) => i / SPIRAL_STEPS,
);

export function KnowledgeUniverseCanvas({
  group,
  docs,
  selectedDocId,
  onSelect,
  phase = "idle",
}: {
  group: ApiKnowledgeGroup;
  docs: ApiDocumentSummary[];
  selectedDocId: string | null;
  onSelect: (id: string) => void;
  phase?: ScenePhase;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<SVGGElement>(null);
  const hovered = useUniverseUi((s) => s.hovered);
  const setHovered = useUniverseUi((s) => s.setHovered);

  const scene = useMemo(() => buildScene(group, docs), [group, docs]);

  // Pan/zoom: imperative, KHONG qua React state - xem ghi chu dau file.
  useEffect(() => {
    const host = hostRef.current;
    const world = worldRef.current;
    if (!host || !world) return;

    let width = host.clientWidth;
    let height = host.clientHeight;
    let cameraX = width / 2;
    let cameraY = height / 2;
    let scale = 1;
    let targetScale = 1;
    let dragging = false;
    // Con tro dang "cho" (pointerdown roi, chua ro la click hay keo) -
    // dragStartX/Y de so voi nguong PAN_THRESHOLD truoc khi thuc su bat dau
    // pan + setPointerCapture. Neu bat capture NGAY tu pointerdown (nhu ban
    // Pixi cu) thi 1 cai CLICK DON THUAN (khong keo) cung bi capture, khien
    // trinh duyet dieu huong pointerup/click toi "host" thay vi node SVG
    // that su duoc bam - React "onClick" tren node se KHONG BAO GIO nhan
    // duoc su kien nua. Ban Pixi cu khong bi anh huong vi Pixi tu hit-test
    // NOI BO (khong dua vao viec native "click" nham dung target DOM).
    let dragCandidatePointerId: number | null = null;
    let dragStartX = 0;
    let dragStartY = 0;
    let lastX = 0;
    let lastY = 0;
    let lastLabelsVisible = true;
    let raf = 0;

    const applyTransform = () => {
      world.setAttribute(
        "transform",
        `translate(${cameraX} ${cameraY}) scale(${scale})`,
      );
      const labelsVisible = scale > 0.7;
      if (labelsVisible !== lastLabelsVisible) {
        lastLabelsVisible = labelsVisible;
        world.dataset.labels = labelsVisible ? "visible" : "hidden";
      }
    };

    const tick = () => {
      scale += (targetScale - scale) * 0.08;
      applyTransform();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const factor = event.deltaY > 0 ? 0.9 : 1.1;
      targetScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetScale * factor));
    };
    const PAN_THRESHOLD = 4;
    const onPointerDown = (event: PointerEvent) => {
      dragCandidatePointerId = event.pointerId;
      dragStartX = event.clientX;
      dragStartY = event.clientY;
      lastX = event.clientX;
      lastY = event.clientY;
    };
    const onPointerMove = (event: PointerEvent) => {
      if (dragCandidatePointerId !== event.pointerId) return;
      if (!dragging) {
        const dist = Math.hypot(
          event.clientX - dragStartX,
          event.clientY - dragStartY,
        );
        if (dist < PAN_THRESHOLD) return;
        dragging = true;
        host.setPointerCapture?.(event.pointerId);
      }
      cameraX += event.clientX - lastX;
      cameraY += event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;
    };
    const onPointerUp = (event: PointerEvent) => {
      if (dragging && host.hasPointerCapture?.(event.pointerId)) {
        host.releasePointerCapture(event.pointerId);
      }
      dragging = false;
      dragCandidatePointerId = null;
    };

    host.addEventListener("wheel", onWheel, { passive: false });
    host.addEventListener("pointerdown", onPointerDown);
    host.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    const resizeObserver = new ResizeObserver(() => {
      width = host.clientWidth;
      height = host.clientHeight;
      if (!dragging) {
        cameraX = width / 2;
        cameraY = height / 2;
      }
    });
    resizeObserver.observe(host);

    applyTransform();

    return () => {
      cancelAnimationFrame(raf);
      host.removeEventListener("wheel", onWheel);
      host.removeEventListener("pointerdown", onPointerDown);
      host.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      resizeObserver.disconnect();
    };
  }, []);

  const linksFadedOut = phase !== "idle";

  return (
    <div className="relative size-full">
      <div
        ref={hostRef}
        className="absolute inset-0 overflow-hidden"
        style={{ touchAction: "none" }}
      >
        <svg className="size-full">
          <g ref={worldRef} data-labels="visible">
            <circle
              r={ORBIT_RADIUS}
              fill="none"
              stroke="#4a6098"
              strokeWidth={1}
              style={{
                opacity: linksFadedOut ? 0 : 0.5,
                transition: "opacity 160ms ease-out",
              }}
            />
            <g
              style={{
                opacity: linksFadedOut ? 0 : 0.38,
                transition: "opacity 160ms ease-out",
              }}
            >
              {scene
                .filter((n) => !n.isHub)
                .map((n) => (
                  <line
                    key={n.id}
                    x1={0}
                    y1={0}
                    x2={n.x}
                    y2={n.y}
                    stroke={n.color}
                    strokeWidth={1}
                  />
                ))}
            </g>
            {scene.map((node) => (
              <NodeView
                key={node.id}
                node={node}
                isSelected={node.id === selectedDocId}
                phase={phase}
                onSelect={onSelect}
                onHover={setHovered}
              />
            ))}
          </g>
        </svg>
      </div>
      {hovered && (
        <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 rounded-xl border border-cyan-300/20 bg-[#070b16]/92 px-3.5 py-2.5 text-center shadow-lg backdrop-blur-xl">
          <div className="text-xs font-semibold text-slate-100">{hovered.title}</div>
          <div className="mt-1 text-[10px] text-slate-500">{hovered.meta}</div>
        </div>
      )}
    </div>
  );
}

function NodeView({
  node,
  isSelected,
  phase,
  onSelect,
  onHover,
}: {
  node: SceneNode;
  isSelected: boolean;
  phase: ScenePhase;
  onSelect: (id: string) => void;
  onHover: (info: HoveredInfo) => void;
}) {
  const spiral = useMemo(
    () =>
      phase === "idle" ? null : spiralKeyframes(node, phase as "closing" | "opening"),
    [node, phase],
  );

  const restingAnimate = { x: node.x, y: node.y, opacity: 1 };
  const restingInitial = { x: node.x, y: node.y, opacity: node.isHub ? 1 : 1 };
  const openingInitial = node.isHub
    ? { x: 0, y: 0, opacity: 0, scale: 0.25 }
    : { x: 0, y: 0, opacity: 0 };

  return (
    <motion.g
      initial={phase === "opening" ? openingInitial : restingInitial}
      animate={spiral ?? restingAnimate}
      transition={
        spiral
          ? {
              duration: MAP_TRANSITION_MS / 1000,
              times: KEYFRAME_TIMES,
              ease: phase === "closing" ? "easeIn" : "easeOut",
            }
          : { duration: 0.2 }
      }
      onPointerEnter={() => onHover({ title: node.title, meta: node.meta })}
      onPointerLeave={() => onHover(null)}
      onClick={() => {
        if (!node.isHub) onSelect(node.id);
      }}
      style={{ cursor: node.isHub ? "default" : "pointer" }}
    >
      <circle r={node.size * 2.4} fill={node.color} opacity={0.14} />
      <circle
        r={node.size + 5}
        fill="none"
        stroke={node.color}
        strokeWidth={1.2}
        opacity={isSelected ? 0.9 : 0.5}
      />
      <g className={`node-core${isSelected ? " selected" : ""}`}>
        <circle r={node.size} fill={node.color} opacity={0.92} />
        <circle r={node.size * 0.46} fill="#ffffff" opacity={0.22} />
      </g>
      <text
        className="node-label"
        y={node.size + 18}
        textAnchor="middle"
        fontSize={node.isHub ? 13 : 11}
        fontWeight={600}
        fill="#f3f7ff"
        stroke="#030711"
        strokeWidth={3}
        paintOrder="stroke"
        style={{ fontFamily: "Inter, Arial, sans-serif" }}
      >
        {node.title}
      </text>
    </motion.g>
  );
}
