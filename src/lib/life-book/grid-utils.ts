// Toan hoc luoi 10x14 vo hinh cua 1 trang GL Life Book. Toa do luu (gridX/Y/W/H)
// LUON la SO NGUYEN o luoi (khong phai px/%) - render (GridBlock.tsx) moi
// quy sang % cua container ngay luc ve, nen khong bao gio tich luy sai so
// lam tron khi resize cua so (moi lan render deu tinh lai % tu dung so
// nguyen goc, khong dua tren px cache tu lan truoc).
export const GRID_COLS = 10;
export const GRID_ROWS = 14;

export type GridRect = {
  gridX: number;
  gridY: number;
  gridW: number;
  gridH: number;
};

// pxToGrid/gridToPx: spec goc chi dat ten 2 tham so (px, pageSize) - THEM 1
// tham so `cellCount` (10 cho truc X, 14 cho truc Y) vi 1 ham DUY NHAT dung
// chung ca 2 truc can biet dang chia may o, khong the suy ra tu rieng
// `pageSize`. Goi pxToGrid(dx, containerRect.width, GRID_COLS) cho truc X,
// pxToGrid(dy, containerRect.height, GRID_ROWS) cho truc Y.
export function pxToGrid(px: number, pageSize: number, cellCount: number): number {
  if (pageSize <= 0) return 0;
  return Math.round((px / pageSize) * cellCount);
}

export function gridToPx(cell: number, pageSize: number, cellCount: number): number {
  return (cell / cellCount) * pageSize;
}

// AABB overlap chuan (khong tinh cham canh la de - dung dieu kien < nghiem
// ngat) - dung cho ca preview luc keo (candidate vs cac block CON LAI, da
// loai chinh no o goi) lan findEmptySlot (candidate vs toan bo block hien co).
export function checkCollision(rect: GridRect, others: GridRect[]): boolean {
  return others.some(
    (o) =>
      rect.gridX < o.gridX + o.gridW &&
      o.gridX < rect.gridX + rect.gridW &&
      rect.gridY < o.gridY + o.gridH &&
      o.gridY < rect.gridY + rect.gridH,
  );
}

// Ep 1 rect nam gon trong bien luoi (0..GRID_COLS/GRID_ROWS) - dung luc keo
// (candidate co the vuot bien neu keo qua gan canh page) truoc khi
// checkCollision, tranh gridX/gridY am hoac vuot qua dau ben kia.
export function clampToGrid(rect: GridRect): GridRect {
  const gridW = Math.min(rect.gridW, GRID_COLS);
  const gridH = Math.min(rect.gridH, GRID_ROWS);
  return {
    gridW,
    gridH,
    gridX: Math.min(Math.max(rect.gridX, 0), GRID_COLS - gridW),
    gridY: Math.min(Math.max(rect.gridY, 0), GRID_ROWS - gridH),
  };
}

// Quet row-major (tren-xuong, trai-qua-phai) tim vi tri TRONG dau tien vua
// du w x h - dung cho nut "+ Add block". null = luoi da day kin, khong con
// cho (PageGrid.tsx im lang bo qua, khong throw).
export function findEmptySlot(
  gridW: number,
  gridH: number,
  existing: GridRect[],
): { gridX: number; gridY: number } | null {
  for (let y = 0; y <= GRID_ROWS - gridH; y++) {
    for (let x = 0; x <= GRID_COLS - gridW; x++) {
      const candidate: GridRect = { gridX: x, gridY: y, gridW, gridH };
      if (!checkCollision(candidate, existing)) return { gridX: x, gridY: y };
    }
  }
  return null;
}

// Rect (o don vi luoi) -> style % cho 1 phan tu absolute trong container -
// dung chung cho GridBlock (block that) lan overlay preview luc keo.
export function gridRectToStyle(rect: GridRect) {
  return {
    left: `${(rect.gridX / GRID_COLS) * 100}%`,
    top: `${(rect.gridY / GRID_ROWS) * 100}%`,
    width: `${(rect.gridW / GRID_COLS) * 100}%`,
    height: `${(rect.gridH / GRID_ROWS) * 100}%`,
  };
}
