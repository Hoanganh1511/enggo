import { describe, expect, it } from "vitest";
import { pushBlocks, type PushableBlock } from "./push-blocks";

// Grid la 10 cot x 14 hang (xem grid-utils.ts) - moi test comment RO toa do
// (dang [x0,x1) x [y0,y1) - nua mo, khop dung checkCollision) de de doi
// chieu bang tay khi doc lai sau nay.
describe("pushBlocks", () => {
  it("khong cham ai -> giu nguyen, success true", () => {
    const resized: PushableBlock = { id: "r", gridX: 0, gridY: 0, gridW: 3, gridH: 2 };
    const others: PushableBlock[] = [
      { id: "a", gridX: 5, gridY: 5, gridW: 2, gridH: 2 },
    ];

    const result = pushBlocks(resized, others, "e");

    expect(result.success).toBe(true);
    expect(result.newBlocks).toBe(others); // tra ve NGUYEN array (khong copy khi khong co gi de day)
  });

  it("cham 1 block, day duoc theo dung huong resize (e)", () => {
    // resized: cols[0,4) rows[0,2). "a": cols[3,5) rows[0,2) -> dam vao cot 3.
    const resized: PushableBlock = { id: "r", gridX: 0, gridY: 0, gridW: 4, gridH: 2 };
    const others: PushableBlock[] = [
      { id: "a", gridX: 3, gridY: 0, gridW: 2, gridH: 2 },
    ];

    const result = pushBlocks(resized, others, "e");

    expect(result.success).toBe(true);
    // Buoc 1 (gridX=4) da het dam vao resized (cols[0,4)) -> cho trong dau tien.
    expect(result.newBlocks).toEqual([
      { id: "a", gridX: 4, gridY: 0, gridW: 2, gridH: 2 },
    ]);
  });

  it("huong chinh bi chan boi bien luoi -> fallback xuong duoi", () => {
    // "a" da sat mep phai (gridX+gridW = 10 = GRID_COLS) - khong the day
    // sang phai duoc nua (buoc 1 da vuot bien) -> phai fallback xuong duoi.
    const resized: PushableBlock = { id: "r", gridX: 0, gridY: 0, gridW: 9, gridH: 2 };
    const others: PushableBlock[] = [
      { id: "a", gridX: 8, gridY: 0, gridW: 2, gridH: 2 },
    ];

    const result = pushBlocks(resized, others, "e");

    expect(result.success).toBe(true);
    // xuong 1 hang (gridY=1) van dam resized (rows[0,2)) -> xuong hang 2 moi thoat.
    expect(result.newBlocks).toEqual([
      { id: "a", gridX: 8, gridY: 2, gridW: 2, gridH: 2 },
    ]);
  });

  it("cham nhieu block, tat ca day duoc -> tat ca doi vi tri, khong con dam nhau", () => {
    // resized: cols[0,6) rows[0,4). "a" cols[4,6) rows[0,2), "b" cols[4,6) rows[2,4) - ca 2 deu dam.
    const resized: PushableBlock = { id: "r", gridX: 0, gridY: 0, gridW: 6, gridH: 4 };
    const others: PushableBlock[] = [
      { id: "a", gridX: 4, gridY: 0, gridW: 2, gridH: 2 },
      { id: "b", gridX: 4, gridY: 2, gridW: 2, gridH: 2 },
    ];

    const result = pushBlocks(resized, others, "e");

    expect(result.success).toBe(true);
    // "a": buoc1 (gridX=5) con dam resized (cols[0,6)) -> buoc2 (gridX=6) thoat.
    // "b": buoc1 (gridX=5) dam resized -> buoc2 (gridX=6) - luc nay phai
    // khong dam CA resized LAN "a" (da doi cho o buoc truoc do trong CUNG
    // 1 lan goi) - xac nhan cascade trong 1 lan goi hoat dong dung.
    expect(result.newBlocks).toEqual([
      { id: "a", gridX: 6, gridY: 0, gridW: 2, gridH: 2 },
      { id: "b", gridX: 6, gridY: 2, gridW: 2, gridH: 2 },
    ]);
  });

  it("block ket goc (het duong ca 2 huong) -> revert toan bo, success false", () => {
    // "a" nam DUNG goc duoi-phai cua luoi (cols[8,10) rows[12,14)) - khong
    // the day phai (vuot GRID_COLS) LAN khong the day xuong (vuot GRID_ROWS).
    const resized: PushableBlock = { id: "r", gridX: 0, gridY: 12, gridW: 9, gridH: 2 };
    const others: PushableBlock[] = [
      { id: "a", gridX: 8, gridY: 12, gridW: 2, gridH: 2 },
    ];

    const result = pushBlocks(resized, others, "e");

    expect(result.success).toBe(false);
    expect(result.newBlocks).toBe(others); // KHONG doi gi ca.
  });

  it("nhieu block, 1 block khong day duoc -> REVERT CA LOAT (kem ca block da day thanh cong truoc do trong cung lan goi)", () => {
    // resized chiem TRON be ngang (cols[0,10)) rows[0,2) - moi block trong
    // dai hang nay KHONG THE day sang ngang (het cho theo ca 2 huong ngang),
    // buoc phai dua vao fallback "xuong duoi".
    const resized: PushableBlock = { id: "r", gridX: 0, gridY: 0, gridW: 10, gridH: 2 };
    const others: PushableBlock[] = [
      // "a" co duong xuong trong (khong bi chan).
      { id: "a", gridX: 0, gridY: 0, gridW: 2, gridH: 2 },
      // "b" bi 1 buc tuong (wall) bit kin TOAN BO duong xuong (rows[2,14)
      // cung cot) - khong con cho nao ca.
      { id: "b", gridX: 5, gridY: 0, gridW: 2, gridH: 2 },
      { id: "wall", gridX: 5, gridY: 2, gridW: 2, gridH: 12 },
    ];

    const result = pushBlocks(resized, others, "e");

    expect(result.success).toBe(false);
    // "a" DUNG RA day thanh cong neu xet rieng - nhung vi "b" that bai, ca
    // ham phai tra ve NGUYEN BAN GOC (ke ca "a"), khong duoc de lai 1 nua
    // thay doi dang do.
    expect(result.newBlocks).toBe(others);
  });

  it("huong 'se' (goc) thu ca 2 truc ngang+doc truoc khi fallback", () => {
    // resized cols[0,5) rows[0,5). "a" cols[4,6) rows[4,6) - dam ca ngang
    // lan doc. Huong "se" uu tien truc ngang (dx:1) truoc.
    const resized: PushableBlock = { id: "r", gridX: 0, gridY: 0, gridW: 5, gridH: 5 };
    const others: PushableBlock[] = [
      { id: "a", gridX: 4, gridY: 4, gridW: 2, gridH: 2 },
    ];

    const result = pushBlocks(resized, others, "se");

    expect(result.success).toBe(true);
    // buoc1 ngang (gridX=5) - cols[5,7) rows[4,6): khong dam resized
    // (cols[0,5)) -> thoat ngay o buoc 1.
    expect(result.newBlocks).toEqual([
      { id: "a", gridX: 5, gridY: 4, gridW: 2, gridH: 2 },
    ]);
  });
});
