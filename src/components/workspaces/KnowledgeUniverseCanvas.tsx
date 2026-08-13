"use client";

import { useEffect, useMemo, useRef } from "react";
import { Application, Container, Graphics, Text, TextStyle } from "pixi.js";
import { create } from "zustand";
import type { ApiDocumentSummary, ApiKnowledgeGroup } from "@/lib/api/types";
import { colorOf } from "./node-color";

// "Knowledge Map" ban Pixi - thay the KnowledgeMap (DOM/SVG quy dao) truoc
// day bang 1 canvas GPU-oriented duy nhat (bê nguyên ky thuat tu source
// rieng "knowledge-universe-pixi": drag pan, scroll zoom, LOD label, resize
// tu dong), giu NGUYEN props signature cu (group/docs/selectedDocId/onSelect)
// de la 1 ban thay the truc tiep trong WorkspaceSwitcher.tsx - KHONG doi gi
// o phia goi (DetailsPanel doc selectedDocId/onSelect nhu cu).
//
// Khac source: (1) node = DU LIEU THAT (hub = KnowledgeGroup dang chon, cac
// node quy dao = tung Document that, toi da 10 giong KnowledgeMap cu), khong
// phai baseNodes mau; (2) "selected doc" dung PROP (selectedDocId/onSelect)
// thay vi giu trong Zustand rieng - WorkspaceSwitcher da la 1 nguon that duy
// nhat cho lua chon nay (DetailsPanel doc theo), giu 2 noi se lech nhau; chi
// con hover/zoom/label-toggle (thuan tuy cuc bo cua canvas) o Zustand; (3)
// KHONG tu ve starfield rieng trong canvas (source co lam) - app da co san
// StarfieldBackground DOM phia sau (backgroundAlpha:0 nen no hien xuyen qua),
// ve them 1 lop sao Pixi rieng se bi trung/lech mat do voi lop DOM.

type HoveredInfo = { title: string; meta: string } | null;

type UniverseUiState = {
  hovered: HoveredInfo;
  showLabels: boolean;
  zoom: number;
  setHovered: (h: HoveredInfo) => void;
  setShowLabels: (v: boolean) => void;
  setZoom: (v: number) => void;
};

const useUniverseUi = create<UniverseUiState>((set) => ({
  hovered: null,
  showLabels: true,
  zoom: 1,
  setHovered: (hovered) => set({ hovered }),
  setShowLabels: (showLabels) => set({ showLabels }),
  setZoom: (zoom) => set({ zoom }),
}));

const HUB_ID = "__hub__";
const HUB_COLOR = 0x22d3ee;
const ORBIT_RADIUS = 150;

function hexToNumber(hex: string): number {
  return parseInt(hex.replace("#", ""), 16);
}

type SceneNode = {
  id: string;
  title: string;
  meta: string;
  isHub: boolean;
  size: number;
  x: number;
  y: number;
  color: number;
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
      color: hexToNumber(colorOf(doc.id)),
    });
  });
  return nodes;
}

export function KnowledgeUniverseCanvas({
  group,
  docs,
  selectedDocId,
  onSelect,
}: {
  group: ApiKnowledgeGroup;
  docs: ApiDocumentSummary[];
  selectedDocId: string | null;
  onSelect: (id: string) => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const hovered = useUniverseUi((s) => s.hovered);
  const setHovered = useUniverseUi((s) => s.setHovered);
  const setZoom = useUniverseUi((s) => s.setZoom);

  // Refs de ticker/handler luon doc gia tri MOI NHAT ma khong phai destroy +
  // init lai toan bo Application moi lan props doi (group/docs khong doi khi
  // chi doi selectedDocId - vd bam sang node khac trong CUNG 1 nhom). Gan
  // ref trong useEffect (khong phai truc tiep trong than render) - eslint
  // react-hooks/refs cam mutate ref luc render.
  const scene = useMemo(() => buildScene(group, docs), [group, docs]);
  const sceneRef = useRef(scene);
  const selectedIdRef = useRef(selectedDocId);
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    sceneRef.current = scene;
  }, [scene]);
  useEffect(() => {
    selectedIdRef.current = selectedDocId;
  }, [selectedDocId]);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!hostRef.current) return;

    let destroyed = false;
    let resizeObserver: ResizeObserver | null = null;

    const init = async () => {
      const host = hostRef.current;
      if (!host) return;

      const app = new Application();
      await app.init({
        resizeTo: host,
        antialias: true,
        backgroundAlpha: 0,
        autoDensity: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
      });

      if (destroyed) {
        app.destroy(true, { children: true, texture: true });
        return;
      }

      host.appendChild(app.canvas);
      app.canvas.style.position = "absolute";
      app.canvas.style.inset = "0";
      app.canvas.style.width = "100%";
      app.canvas.style.height = "100%";
      app.canvas.style.touchAction = "none";

      const world = new Container();
      const orbitLayer = new Container();
      const linkLayer = new Container();
      const nodeLayer = new Container();
      world.addChild(orbitLayer, linkLayer, nodeLayer);
      app.stage.addChild(world);

      // Text trong Pixi render ra 1 texture bitmap rieng - neu KHONG dat
      // resolution explicit, no mac dinh dung resolution CHUNG cua app luc
      // Text duoc TAO (co the la 1, truoc khi autoDensity ap dung), khien
      // chu bi "mờ"/rang cua tren man HiDPI. Dat bang chinh resolution cua
      // app (= devicePixelRatio, toi da 2) de chu luon net.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      let width = host.clientWidth;
      let height = host.clientHeight;
      let cameraX = width / 2;
      let cameraY = height / 2;
      let scale = 1;
      let targetScale = 1;
      let dragging = false;
      let lastX = 0;
      let lastY = 0;

      const drawOrbit = () => {
        orbitLayer.removeChildren().forEach((c) => c.destroy());
        const g = new Graphics();
        g.circle(0, 0, ORBIT_RADIUS).stroke({
          color: 0x4a6098,
          width: 1,
          alpha: 0.5,
        });
        orbitLayer.addChild(g);
      };

      const nodeViews = new Map<
        string,
        { root: Container; core: Graphics; ring: Graphics; label: Text }
      >();

      const makeNode = (node: SceneNode) => {
        const root = new Container();
        root.eventMode = "static";
        root.cursor = "pointer";

        const glow = new Graphics();
        glow.circle(0, 0, node.size * 2.4).fill({ color: node.color, alpha: 0.14 });
        root.addChild(glow);

        const ring = new Graphics();
        ring.circle(0, 0, node.size + 5).stroke({
          color: node.color,
          width: 1.2,
          alpha: 0.5,
        });
        root.addChild(ring);

        const core = new Graphics();
        core.circle(0, 0, node.size).fill({ color: node.color, alpha: 0.92 });
        core.circle(0, 0, node.size * 0.46).fill({ color: 0xffffff, alpha: 0.22 });
        root.addChild(core);

        const label = new Text({
          text: node.title,
          resolution: dpr,
          style: new TextStyle({
            fontFamily: "Inter, Arial, sans-serif",
            fontSize: node.isHub ? 13 : 11,
            fontWeight: "600",
            fill: 0xf3f7ff,
            align: "center",
            stroke: { color: 0x030711, width: 3 },
          }),
        });
        label.anchor.set(0.5, 0);
        label.y = node.size + 10;
        label.alpha = 1;
        root.addChild(label);

        root.on("pointerover", () => setHovered({ title: node.title, meta: node.meta }));
        root.on("pointerout", () => setHovered(null));
        root.on("pointertap", () => {
          if (!node.isHub) onSelectRef.current(node.id);
        });

        nodeLayer.addChild(root);
        nodeViews.set(node.id, { root, core, ring, label });
      };

      sceneRef.current.forEach(makeNode);

      const drawLinks = () => {
        linkLayer.removeChildren().forEach((c) => c.destroy());
        const hub = sceneRef.current.find((n) => n.isHub);
        if (!hub) return;
        sceneRef.current.forEach((node) => {
          if (node.isHub) return;
          const g = new Graphics();
          g.moveTo(hub.x, hub.y).lineTo(node.x, node.y).stroke({
            color: node.color,
            width: 1,
            alpha: 0.38,
          });
          linkLayer.addChild(g);
        });
      };

      drawLinks();

      const rebuildNodes = () => {
        nodeViews.forEach((view) => view.root.destroy({ children: true }));
        nodeViews.clear();
        nodeLayer.removeChildren();
        sceneRef.current.forEach(makeNode);
        drawLinks();
      };

      let knownNodeIds = sceneRef.current.map((n) => n.id).join(",");

      const updateWorld = () => {
        // Doc lai scene MOI NHAT moi frame (ref, khong trigger re-render) -
        // neu danh sach node THAY DOI THAT (doi group/them bai viet) thi ve
        // lai; neu chi gia tri node giu nguyen thi chi cap nhat vi tri/style.
        const nextIds = sceneRef.current.map((n) => n.id).join(",");
        if (nextIds !== knownNodeIds) {
          knownNodeIds = nextIds;
          rebuildNodes();
        }

        world.position.set(cameraX, cameraY);
        world.scale.set(scale);

        sceneRef.current.forEach((node) => {
          const view = nodeViews.get(node.id);
          if (!view) return;
          view.root.position.set(node.x, node.y);
          view.label.visible = scale > 0.7;

          const isSelected = node.id === selectedIdRef.current;
          const pulse = 1 + Math.sin(app.ticker.lastTime / 700 + node.x) * 0.035;
          view.core.scale.set(isSelected ? pulse * 1.18 : pulse);
          view.ring.alpha = isSelected ? 0.9 : 0.5;
        });
      };

      const centerWorld = () => {
        cameraX = width / 2;
        cameraY = height / 2;
      };

      const onWheel = (event: WheelEvent) => {
        event.preventDefault();
        const factor = event.deltaY > 0 ? 0.9 : 1.1;
        targetScale = Math.max(0.55, Math.min(2.8, targetScale * factor));
        setZoom(targetScale);
      };

      const onPointerDown = (event: PointerEvent) => {
        dragging = true;
        lastX = event.clientX;
        lastY = event.clientY;
        app.canvas.setPointerCapture?.(event.pointerId);
      };

      const onPointerMove = (event: PointerEvent) => {
        if (!dragging) return;
        cameraX += event.clientX - lastX;
        cameraY += event.clientY - lastY;
        lastX = event.clientX;
        lastY = event.clientY;
      };

      const onPointerUp = () => {
        dragging = false;
      };

      app.canvas.addEventListener("wheel", onWheel, { passive: false });
      app.canvas.addEventListener("pointerdown", onPointerDown);
      app.canvas.addEventListener("pointermove", onPointerMove);
      app.canvas.addEventListener("pointerup", onPointerUp);
      app.canvas.addEventListener("pointercancel", onPointerUp);

      resizeObserver = new ResizeObserver(() => {
        width = host.clientWidth;
        height = host.clientHeight;
        if (!dragging) centerWorld();
      });
      resizeObserver.observe(host);

      drawOrbit();
      centerWorld();

      app.ticker.add(() => {
        scale += (targetScale - scale) * 0.08;
        updateWorld();
      });

      return () => {
        app.canvas.removeEventListener("wheel", onWheel);
        app.canvas.removeEventListener("pointerdown", onPointerDown);
        app.canvas.removeEventListener("pointermove", onPointerMove);
        app.canvas.removeEventListener("pointerup", onPointerUp);
        app.canvas.removeEventListener("pointercancel", onPointerUp);
        resizeObserver?.disconnect();
        app.destroy(true, { children: true, texture: true });
      };
    };

    let cleanup: (() => void) | undefined;
    init().then((fn) => {
      cleanup = fn;
    });

    return () => {
      destroyed = true;
      cleanup?.();
    };
    // 1 Application duy nhat cho vong doi component - doc group/docs/
    // selectedDocId/onSelect moi qua ref (xem tren) thay vi deps, tranh
    // destroy + init lai Pixi app moi lan cac prop nay doi.
  }, [setHovered, setZoom]);

  return (
    <div className="relative size-full">
      <div ref={hostRef} className="absolute inset-0 overflow-hidden" />
      {hovered && (
        <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 rounded-xl border border-cyan-300/20 bg-[#070b16]/92 px-3.5 py-2.5 text-center shadow-lg backdrop-blur-xl">
          <div className="text-xs font-semibold text-slate-100">{hovered.title}</div>
          <div className="mt-1 text-[10px] text-slate-500">{hovered.meta}</div>
        </div>
      )}
    </div>
  );
}
