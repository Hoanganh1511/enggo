// Sub-phase 6.5 - doi so hang/cot cua 1 TableElementData qua PropertiesPanel.tsx
// can dung lai NOI DUNG cac o CU (khong xoa trang khi nguoi dung chi doi
// rows/cols ke can) - ham nay GIU nguyen gia tri o cu trong vung giao nhau,
// dien "" cho o moi.
export function resizeTableCells(cells: string[][], rows: number, cols: number): string[][] {
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => cells[row]?.[col] ?? ""),
  );
}
