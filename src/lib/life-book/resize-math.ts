import { GRID_COLS, GRID_ROWS, type GridRect } from "./grid-utils";
import type { ResizeDirection } from "./push-blocks";

// Ap 1 delta (so o luoi, co the am) tu vi tri BAT DAU keo (`start`) theo 1
// handle - "e"/"s" chi doi W/H (canh doi dien co dinh); "w"/"n" GIU CO
// DINH canh doi dien (phai/duoi) va doi CA gridX/gridY LAN W/H, dam bao
// W/H khong bao gio duoi 1 (Math.min(rawX, right-1) ep gridX toi da chi
// den right-1, tuong duong W toi thieu 1). Goc (vd "se") = 2 canh don
// LIEN TIEP ("s" roi "e"), khong anh huong lan nhau vi 1 canh chi doi
// truc cua RIENG no.
export function applyResizeDelta(
  start: GridRect,
  direction: ResizeDirection,
  dx: number,
  dy: number,
): GridRect {
  let { gridX, gridY, gridW, gridH } = start;

  if (direction.includes("e")) {
    gridW = Math.max(1, start.gridW + dx);
  }
  if (direction.includes("w")) {
    const right = start.gridX + start.gridW;
    gridX = Math.min(start.gridX + dx, right - 1);
    gridW = right - gridX;
  }
  if (direction.includes("s")) {
    gridH = Math.max(1, start.gridH + dy);
  }
  if (direction.includes("n")) {
    const bottom = start.gridY + start.gridH;
    gridY = Math.min(start.gridY + dy, bottom - 1);
    gridH = bottom - gridY;
  }

  return { gridX, gridY, gridW, gridH };
}

// Ep khong vuot bien luoi (SAU khi applyResizeDelta da dam bao W/H>=1) -
// tach rieng buoc nay vi bien luoi khong phu thuoc huong resize, chi phu
// thuoc vi tri/kich thuoc cuoi cung.
export function clampResizeToBounds(rect: GridRect): GridRect {
  const gridX = Math.max(0, rect.gridX);
  const gridY = Math.max(0, rect.gridY);
  const gridW = Math.min(rect.gridW, GRID_COLS - gridX);
  const gridH = Math.min(rect.gridH, GRID_ROWS - gridY);
  return { gridX, gridY, gridW, gridH };
}
