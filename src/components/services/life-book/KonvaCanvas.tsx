"use client";

import { useEffect, useRef, useState, type DragEvent as ReactDragEvent } from "react";
import { Stage, Layer, Rect, Transformer } from "react-konva";
import type Konva from "konva";
import { CanvasElementRenderer } from "./canvas-elements/CanvasElementRenderer";
import type { ToolKey } from "@/lib/life-book/create-canvas-element";
import type { CanvasElementData } from "@/lib/life-book/canvas-elements";
import type { ElementInteraction } from "@/lib/life-book/canvas-element-interaction";
import { STICKER_DND_MIME } from "@/lib/life-book/sticker-render";

type BasicToolKey = Exclude<ToolKey, "sticker">;

const MIN_SCALE = 0.25;
const MAX_SCALE = 3;
const ZOOM_STEP = 1.05;
const MIN_ELEMENT_SIZE = 20;
// Nguong (px MAN HINH) de phan biet "bam" (click don gian, chi bo chon) voi
// "keo" (rubber-band that su) khi tha chuot tren vung trong cua canvas.
const DRAG_SELECT_THRESHOLD = 4;
// Kich thuoc "vung ao" phu dot-grid - du lon de pan/zoom trong pham vi hop
// ly (Phase 6.1) ma khong "het cham" - se xem lai neu Phase sau can canvas
// vo han that su.
const VIRTUAL_SIZE = 8000;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

type Rectangle = { x: number; y: number; width: number; height: number };

function rectsIntersect(a: Rectangle, b: Rectangle): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// Tao 1 canvas nho (tile) lam fillPatternImage cho Layer nen - 1 Rect DUY
// NHAT dung pattern lap lai, thay vi hang nghin <Circle> rieng le (re hon
// nhieu cho Konva render/hit-test).
function createDotTile(): HTMLCanvasElement {
  const size = 24;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 1.3, 0, Math.PI * 2);
    ctx.fill();
  }
  return canvas;
}

// Sub-phase 6.1: Stage/Layer + zoom (Ctrl+scroll) + pan (giu Space + keo) +
// nen dot-grid nhe. Sub-phase 6.2: 4 loai element (Text/Image/Table/Sticker) +
// Konva shape rieng cho tung loai (xem canvas-elements/). Sub-phase 6.3:
// `elements` gio la du lieu THAT (chu so huu la BlockModal.tsx, truyen
// xuong dang props) - component nay CHI render + xu ly DROP that su (native
// HTML5 Drag & Drop tren div NGOAI cua Stage, khong phai qua @dnd-kit vi
// diem tha nam tren 1 <canvas> Konva ve rieng, khong phai node DOM thuong).
// Sub-phase 6.4: chon 1/nhieu element (click, Shift+click, rubber-band keo
// tren vung trong) + Konva.Transformer that su cho move/resize/rotate - commit
// thay doi ve BlockModal.tsx qua `onUpdateElement`. Sub-phase 6.5: `selectedIds`
// chuyen thanh state cua BlockModal.tsx (props xuong day) thay vi state noi
// bo, vi PropertiesPanel.tsx (component anh em, cung con cua BlockModal) cung
// can biet dang chon gi.
export function KonvaCanvas({
  elements,
  onDropTool,
  onDropSticker,
  onUpdateElement,
  selectedIds,
  onSelectionChange,
}: {
  elements: CanvasElementData[];
  onDropTool: (tool: BasicToolKey, worldPos: { x: number; y: number }) => void;
  onDropSticker: (src: string, worldPos: { x: number; y: number }) => void;
  onUpdateElement: (id: string, patch: Partial<CanvasElementData>) => void;
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [spacePressed, setSpacePressed] = useState(false);
  const [dotTile] = useState<HTMLCanvasElement>(() => createDotTile());
  // Vung keo-chon (rubber-band) - luu o toa do MAN HINH (khop voi
  // getPointerPosition()) de ve overlay HTML don gian, khong can quy doi moi
  // frame; chi quy doi 1 LAN sang toa do THE GIOI luc tha chuot (xem
  // handleStageMouseUp).
  const [dragSelectRect, setDragSelectRect] = useState<Rectangle | null>(null);
  const dragSelectStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Pan = giu Space + keo (spec) - lang nghe tren window (khong chi trong
  // canvas) de tha phim ngoai vung canvas van tat pan dung cach.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.code === "Space") setSpacePressed(true);
    }
    function handleKeyUp(e: KeyboardEvent) {
      if (e.code === "Space") setSpacePressed(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Gan lai danh sach node duoc chon cho Transformer moi khi selectedIds hoac
  // ban than elements doi - tra node THAT qua `stage.findOne('#'+id)` (moi
  // shape da co `id={data.id}`, xem *ElementShape.tsx) thay vi tu quan 1 Map
  // ref rieng (tranh dong 1 callback ref qua props sang component con, xem
  // ghi chu trong canvas-element-interaction.ts). Day la thao tac tren node
  // Konva THAT (khong phai React state) nen lam trong effect la dung cho.
  useEffect(() => {
    const transformer = transformerRef.current;
    const stage = stageRef.current;
    if (!transformer || !stage) return;
    const nodes = [...selectedIds]
      .map((id) => stage.findOne(`#${id}`))
      .filter((node): node is Konva.Node => node !== undefined);
    transformer.nodes(nodes);
    transformer.getLayer()?.batchDraw();
  }, [selectedIds, elements]);

  // Zoom = giu Ctrl + scroll (spec) - cong thuc chuan "zoom quanh con tro"
  // cua Konva: giu nguyen diem duoi con tro khong "troi" khi ty le doi.
  function handleWheel(e: Konva.KonvaEventObject<WheelEvent>) {
    if (!e.evt.ctrlKey) return;
    e.evt.preventDefault();

    const stage = stageRef.current;
    const pointer = stage?.getPointerPosition();
    if (!stage || !pointer) return;

    const pointTo = {
      x: (pointer.x - stagePos.x) / scale,
      y: (pointer.y - stagePos.y) / scale,
    };

    const zoomingIn = e.evt.deltaY < 0;
    const newScale = clamp(
      zoomingIn ? scale * ZOOM_STEP : scale / ZOOM_STEP,
      MIN_SCALE,
      MAX_SCALE,
    );

    setScale(newScale);
    setStagePos({
      x: pointer.x - pointTo.x * newScale,
      y: pointer.y - pointTo.y * newScale,
    });
  }

  // Tha 1 tool tu CanvasToolbar.tsx hoac 1 sticker tu StickerLibraryPopover.tsx
  // (native HTML5 DnD) - quy doi toa do MAN HINH (px trong container nay)
  // sang toa do THE GIOI cua Stage bang cach dao nguoc chinh xac phep bien
  // doi pan/zoom hien tai (CUNG cong thuc voi handleWheel o tren). Sticker
  // dung MIME type RIENG (STICKER_DND_MIME) - kiem tra truoc "text/plain" vi
  // ca 2 co the cung xuat hien tren 1 su kien keo-tha (trinh duyet cho phep
  // gan nhieu MIME cho cung 1 thao tac keo, xem StickerLibraryPopover.tsx).
  function handleDrop(e: ReactDragEvent<HTMLDivElement>) {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const worldPos = {
      x: (e.clientX - rect.left - stagePos.x) / scale,
      y: (e.clientY - rect.top - stagePos.y) / scale,
    };

    const stickerSrc = e.dataTransfer.getData(STICKER_DND_MIME);
    if (stickerSrc) {
      onDropSticker(stickerSrc, worldPos);
      return;
    }

    const tool = e.dataTransfer.getData("text/plain") as BasicToolKey | "";
    if (!tool) return;
    onDropTool(tool, worldPos);
  }

  function handleSelect(id: string, e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) {
    // Ngan Stage nhan tiep su kien nay la "bam vung trong" (se xoa chon) -
    // xem handleStageMouseDown.
    e.cancelBubble = true;
    const isMouseEvent = "shiftKey" in e.evt;
    const additive = isMouseEvent && (e.evt as MouseEvent).shiftKey;
    if (additive) {
      const next = new Set(selectedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      onSelectionChange(next);
    } else {
      onSelectionChange(new Set([id]));
    }
  }

  function handleElementDragEnd(id: string, e: Konva.KonvaEventObject<DragEvent>) {
    onUpdateElement(id, { x: e.target.x(), y: e.target.y() });
  }

  // Chuan Konva cho resize qua Transformer: Transformer chinh scaleX/scaleY
  // cua node (khong tu doi width/height) - reset scale ve 1 va nhan vao
  // width/height that de luu du lieu SACH (khong luu he so scale rieng),
  // tranh font/border bi keo meo khi render lai tu data.
  function handleElementTransformEnd(id: string, e: Konva.KonvaEventObject<Event>) {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    onUpdateElement(id, {
      x: node.x(),
      y: node.y(),
      width: Math.max(MIN_ELEMENT_SIZE, node.width() * scaleX),
      height: Math.max(MIN_ELEMENT_SIZE, node.height() * scaleY),
      rotation: node.rotation(),
    });
  }

  function handleStageMouseDown(e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) {
    const stage = e.target.getStage();
    if (!stage || e.target !== stage) return; // bam vao 1 shape - de onClick cua shape do tu xu ly chon.
    onSelectionChange(new Set());
    const pos = stage.getPointerPosition();
    if (!pos) return;
    dragSelectStartRef.current = pos;
    setDragSelectRect({ x: pos.x, y: pos.y, width: 0, height: 0 });
  }

  function handleStageMouseMove() {
    const start = dragSelectStartRef.current;
    if (!start) return;
    const pos = stageRef.current?.getPointerPosition();
    if (!pos) return;
    setDragSelectRect({
      x: Math.min(start.x, pos.x),
      y: Math.min(start.y, pos.y),
      width: Math.abs(pos.x - start.x),
      height: Math.abs(pos.y - start.y),
    });
  }

  function handleStageMouseUp() {
    const rect = dragSelectRect;
    dragSelectStartRef.current = null;
    setDragSelectRect(null);
    if (!rect || (rect.width < DRAG_SELECT_THRESHOLD && rect.height < DRAG_SELECT_THRESHOLD)) {
      return; // chi la 1 click don gian tren vung trong - da xoa chon o mousedown.
    }

    // Quy doi rect tu MAN HINH sang THE GIOI (dao nguoc pan/zoom, cung cong
    // thuc voi handleWheel/handleDrop) de so voi toa do THAT cua element.
    const worldRect: Rectangle = {
      x: (rect.x - stagePos.x) / scale,
      y: (rect.y - stagePos.y) / scale,
      width: rect.width / scale,
      height: rect.height / scale,
    };

    const hitIds = elements
      .filter((el) => rectsIntersect(worldRect, { x: el.x, y: el.y, width: el.width, height: el.height }))
      .map((el) => el.id);
    onSelectionChange(new Set(hitIds));
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden"
      style={{ cursor: spacePressed ? "grab" : "default" }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }}
      onDrop={handleDrop}
    >
      {size.width > 0 && size.height > 0 && (
        <Stage
          ref={stageRef}
          width={size.width}
          height={size.height}
          scaleX={scale}
          scaleY={scale}
          x={stagePos.x}
          y={stagePos.y}
          draggable={spacePressed}
          onWheel={handleWheel}
          onMouseDown={handleStageMouseDown}
          onMouseMove={handleStageMouseMove}
          onMouseUp={handleStageMouseUp}
          onDragEnd={(e) => {
            if (e.target !== e.target.getStage()) return;
            setStagePos({ x: e.target.x(), y: e.target.y() });
          }}
        >
          <Layer listening={false}>
            <Rect
              x={-VIRTUAL_SIZE / 2}
              y={-VIRTUAL_SIZE / 2}
              width={VIRTUAL_SIZE}
              height={VIRTUAL_SIZE}
              // Konva.Shape.fillPatternImage NHAN ca HTMLCanvasElement luc
              // chay that (xem GetSet<HTMLImageElement | HTMLCanvasElement>
              // trong konva/lib/Shape.d.ts) nhung type cua PROPS (ShapeConfig)
              // chi khai bao HTMLImageElement - 1 khoang trong type-def cua
              // chinh Konva, khong phai loi o day. Ep kieu co chu dich.
              fillPatternImage={dotTile as unknown as HTMLImageElement}
              fillPatternRepeat="repeat"
            />
          </Layer>

          {/* Layer noi dung that - tao qua CanvasToolbar.tsx (keo tha hoac
              bam), xem BlockModal.tsx (chu so huu state `elements`). */}
          <Layer>
            {elements.map((el) => {
              const interaction: ElementInteraction = {
                isSelected: selectedIds.has(el.id),
                onSelect: (e) => handleSelect(el.id, e),
                onDragEnd: (e) => handleElementDragEnd(el.id, e),
                onTransformEnd: (e) => handleElementTransformEnd(el.id, e),
              };
              return (
                <CanvasElementRenderer key={el.id} element={el} interaction={interaction} />
              );
            })}
            <Transformer
              ref={transformerRef}
              rotateEnabled
              boundBoxFunc={(oldBox, newBox) =>
                newBox.width < MIN_ELEMENT_SIZE || newBox.height < MIN_ELEMENT_SIZE ? oldBox : newBox
              }
            />
          </Layer>
        </Stage>
      )}

      {dragSelectRect && (
        <div
          className="pointer-events-none absolute border border-dashed border-blue-500 bg-blue-500/10"
          style={{
            left: dragSelectRect.x,
            top: dragSelectRect.y,
            width: dragSelectRect.width,
            height: dragSelectRect.height,
          }}
        />
      )}

      <div className="pointer-events-none absolute right-3 bottom-3 rounded-md border border-border bg-surface/90 px-2 py-1 text-[11px] text-ink-faint">
        {Math.round(scale * 100)}%
      </div>
    </div>
  );
}
