"use client";

import { Image as KonvaImage } from "react-konva";
import { useHtmlImage } from "@/lib/life-book/use-html-image";
import type { StickerElementData } from "@/lib/life-book/canvas-elements";
import type { ElementInteraction } from "@/lib/life-book/canvas-element-interaction";

// Cau truc render giong het ImageElementShape (van la 1 anh) - tach RIENG
// component (khong tai su dung chung 1 component voi Image) vi StickerElementData
// la 1 TYPE rieng trong CanvasElementData (nguon goc tu thu vien preset, xem
// Sub-phase 6.6), du hien tai chua co field khac biet nao ve mat render.
export function StickerElementShape({
  data,
  interaction,
}: {
  data: StickerElementData;
  interaction: ElementInteraction;
}) {
  const image = useHtmlImage(data.src);

  return (
    <KonvaImage
      id={data.id}
      image={image}
      x={data.x}
      y={data.y}
      width={data.width}
      height={data.height}
      rotation={data.rotation}
      opacity={data.opacity}
      draggable
      onClick={interaction.onSelect}
      onTap={interaction.onSelect}
      onDragEnd={interaction.onDragEnd}
      onTransformEnd={interaction.onTransformEnd}
    />
  );
}
