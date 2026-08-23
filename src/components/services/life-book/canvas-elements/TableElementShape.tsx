"use client";

import { Fragment } from "react";
import { Group, Rect, Text } from "react-konva";
import type { TableElementData } from "@/lib/life-book/canvas-elements";
import type { ElementInteraction } from "@/lib/life-book/canvas-element-interaction";

// Spec yeu cau render bang Group + Rect + Text (khong dung 1 shape Table co
// san cua Konva - khong ton tai) - 1 Rect vien cho MOI o (lam luoi ke), 1
// Text tuy chon neu o do co noi dung.
export function TableElementShape({
  data,
  interaction,
}: {
  data: TableElementData;
  interaction: ElementInteraction;
}) {
  const cellWidth = data.width / data.cols;
  const cellHeight = data.height / data.rows;

  return (
    <Group
      id={data.id}
      x={data.x}
      y={data.y}
      width={data.width}
      height={data.height}
      rotation={data.rotation}
      draggable
      onClick={interaction.onSelect}
      onTap={interaction.onSelect}
      onDragEnd={interaction.onDragEnd}
      onTransformEnd={interaction.onTransformEnd}
    >
      {Array.from({ length: data.rows }, (_, row) =>
        Array.from({ length: data.cols }, (_, col) => {
          const cellX = col * cellWidth;
          const cellY = row * cellHeight;
          const text = data.cells[row]?.[col] ?? "";
          return (
            <Fragment key={`${row}-${col}`}>
              <Rect
                x={cellX}
                y={cellY}
                width={cellWidth}
                height={cellHeight}
                stroke="#d4d4d8"
                strokeWidth={1}
                fill="#ffffff"
              />
              {text && (
                <Text
                  x={cellX + data.cellPadding}
                  y={cellY + data.cellPadding}
                  width={Math.max(0, cellWidth - data.cellPadding * 2)}
                  height={Math.max(0, cellHeight - data.cellPadding * 2)}
                  text={text}
                  fontSize={13}
                  fill="#18181b"
                  wrap="word"
                />
              )}
            </Fragment>
          );
        }),
      )}
    </Group>
  );
}
