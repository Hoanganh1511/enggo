"use client";

import type { CanvasElementData } from "@/lib/life-book/canvas-elements";
import type { ElementInteraction } from "@/lib/life-book/canvas-element-interaction";
import { TextElementShape } from "./TextElementShape";
import { ImageElementShape } from "./ImageElementShape";
import { TableElementShape } from "./TableElementShape";
import { StickerElementShape } from "./StickerElementShape";

// Dispatcher theo `element.type` - moi loai co 1 Konva shape rieng (xem
// tung file *ElementShape.tsx). `_exhaustive: never` bao TypeScript bao loi
// bien dich neu sau nay them 1 type moi vao CanvasElementData ma quen xu ly
// o day. Sub-phase 6.4: nhan them `interaction` (select/drag/transform, xem
// canvas-element-interaction.ts) tu KonvaCanvas.tsx va truyen THANG xuong -
// component nay van chi la dispatcher, khong tu gan logic tuong tac.
export function CanvasElementRenderer({
  element,
  interaction,
}: {
  element: CanvasElementData;
  interaction: ElementInteraction;
}) {
  switch (element.type) {
    case "text":
      return <TextElementShape data={element} interaction={interaction} />;
    case "image":
      return <ImageElementShape data={element} interaction={interaction} />;
    case "table":
      return <TableElementShape data={element} interaction={interaction} />;
    case "sticker":
      return <StickerElementShape data={element} interaction={interaction} />;
    default: {
      const _exhaustive: never = element;
      return _exhaustive;
    }
  }
}
