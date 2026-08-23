"use client";

import { Text } from "react-konva";
import type { TextElementData } from "@/lib/life-book/canvas-elements";
import type { ElementInteraction } from "@/lib/life-book/canvas-element-interaction";

export function TextElementShape({
  data,
  interaction,
}: {
  data: TextElementData;
  interaction: ElementInteraction;
}) {
  return (
    <Text
      id={data.id}
      x={data.x}
      y={data.y}
      width={data.width}
      height={data.height}
      rotation={data.rotation}
      text={data.text}
      fontFamily={data.fontFamily}
      fontSize={data.fontSize}
      fontStyle={data.fontStyle}
      textDecoration={data.textDecoration}
      fill={data.fill}
      align={data.align}
      verticalAlign="middle"
      wrap="word"
      draggable
      onClick={interaction.onSelect}
      onTap={interaction.onSelect}
      onDragEnd={interaction.onDragEnd}
      onTransformEnd={interaction.onTransformEnd}
    />
  );
}
