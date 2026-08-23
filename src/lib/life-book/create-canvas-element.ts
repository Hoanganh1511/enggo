import { nanoid } from "nanoid";
import {
  DEFAULT_PARAGRAPH_FONT_SIZE,
  DEFAULT_TITLE_FONT_SIZE,
  type CanvasElementData,
} from "./canvas-elements";

export type ToolKey = "title" | "paragraph" | "image" | "table" | "sticker";

// Tao 1 CanvasElementData moi tu 1 nut Toolbar (Sub-phase 6.3) - `center` la
// toa do THE GIOI (world, da quy doi tu pan/zoom hien tai cua Stage, xem
// KonvaCanvas.tsx) noi element se xuat hien, phan tu duoc dat CAN GIUA vao
// diem do (khong phai goc tren-trai). `imageSrc` CHI dung cho tool "image"
// (anh that nguoi dung vua chon, xem BlockModal.tsx) - cac tool con lai bo
// qua tham so nay.
export function createElementFromTool(
  tool: ToolKey,
  center: { x: number; y: number },
  imageSrc?: string,
): CanvasElementData {
  const id = nanoid();

  switch (tool) {
    case "title":
      return {
        id,
        type: "text",
        x: center.x - 110,
        y: center.y - 20,
        width: 220,
        height: 40,
        rotation: 0,
        text: "Tiêu đề mới",
        fontFamily: "Inter, sans-serif",
        fontSize: DEFAULT_TITLE_FONT_SIZE,
        fill: "#171717",
        align: "left",
        fontStyle: "bold",
        textDecoration: "",
      };
    case "paragraph":
      return {
        id,
        type: "text",
        x: center.x - 150,
        y: center.y - 40,
        width: 300,
        height: 80,
        rotation: 0,
        text: "Nhập nội dung...",
        fontFamily: "Inter, sans-serif",
        fontSize: DEFAULT_PARAGRAPH_FONT_SIZE,
        fill: "#3f3f46",
        align: "left",
        fontStyle: "normal",
        textDecoration: "",
      };
    case "image":
      return {
        id,
        type: "image",
        x: center.x - 100,
        y: center.y - 75,
        width: 200,
        height: 150,
        rotation: 0,
        src: imageSrc ?? "",
        opacity: 1,
        cornerRadius: 0,
      };
    case "table":
      return {
        id,
        type: "table",
        x: center.x - 120,
        y: center.y - 60,
        width: 240,
        height: 120,
        rotation: 0,
        rows: 3,
        cols: 3,
        cellPadding: 6,
        cells: [
          ["", "", ""],
          ["", "", ""],
          ["", "", ""],
        ],
      };
    case "sticker":
      return {
        id,
        type: "sticker",
        x: center.x - 35,
        y: center.y - 35,
        width: 70,
        height: 70,
        rotation: 0,
        src: imageSrc ?? "",
        opacity: 1,
      };
  }
}
