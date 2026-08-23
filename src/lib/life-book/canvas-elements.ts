// 4 loai element tu do tren canvas Konva (ben trong BlockModal, xem
// KonvaCanvas.tsx). CHUA gan voi Block.content that (Sub-phase 6.7 moi lam
// serialize/save qua stage.toJSON()) - day chi la data model + Konva shape
// tuong ung tung loai.
export type BaseElement = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // do (Konva dung do, khong phai radian)
};

// title/paragraph la 2 BIEN THE cua CUNG 1 type "text" (khac fontSize MAC
// DINH luc tao, xem DEFAULT_TITLE_FONT_SIZE/DEFAULT_PARAGRAPH_FONT_SIZE) -
// khong tach thanh 2 type rieng vi sau khi tao, nguoi dung chinh fontSize tu
// do qua Properties panel (Sub-phase 6.5), khong con phan biet "van la
// title hay paragraph" o muc du lieu nua.
export type TextElementData = BaseElement & {
  type: "text";
  text: string;
  fontFamily: string;
  fontSize: number;
  fill: string;
  align: "left" | "center" | "right";
  fontStyle: string; // "normal" | "bold" | "italic" | "bold italic" (dung format cua Konva.Text)
  textDecoration: string; // "" | "underline"
};

export type ImageElementData = BaseElement & {
  type: "image";
  // MVP: base64 data URL (spec cho phep "S3-compatible hoặc base64 cho MVP") -
  // chua co upload that len S3, se xem lai khi can luu file lon/nhieu anh.
  src: string;
  opacity: number;
  cornerRadius: number;
};

export type TableElementData = BaseElement & {
  type: "table";
  rows: number;
  cols: number;
  cellPadding: number;
  cells: string[][]; // [row][col], "" = o rong
};

// Giong ImageElementData ve cau truc (van la 1 anh) nhung tach TYPE rieng vi
// nguon goc khac nhau (thu vien preset, xem Sub-phase 6.6) - co the mo rong
// them field rieng (vd packId) sau ma khong anh huong ImageElementData.
export type StickerElementData = BaseElement & {
  type: "sticker";
  src: string;
  opacity: number;
};

export type CanvasElementData =
  | TextElementData
  | ImageElementData
  | TableElementData
  | StickerElementData;

export const DEFAULT_TITLE_FONT_SIZE = 28;
export const DEFAULT_PARAGRAPH_FONT_SIZE = 15;
