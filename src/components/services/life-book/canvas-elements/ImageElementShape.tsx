"use client";

import { Image as KonvaImage } from "react-konva";
import { useHtmlImage } from "@/lib/life-book/use-html-image";
import type { ImageElementData } from "@/lib/life-book/canvas-elements";
import type { ElementInteraction } from "@/lib/life-book/canvas-element-interaction";

export function ImageElementShape({
  data,
  interaction,
}: {
  data: ImageElementData;
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
      cornerRadius={data.cornerRadius}
      draggable
      onClick={interaction.onSelect}
      onTap={interaction.onSelect}
      onDragEnd={interaction.onDragEnd}
      onTransformEnd={interaction.onTransformEnd}
    />
  );
}
