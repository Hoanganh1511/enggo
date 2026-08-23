import { GRID_COLS, GRID_ROWS, checkCollision, type GridRect } from "./grid-utils";

export type ResizeDirection = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

export type PushableBlock = GridRect & { id: string };

export type PushResult = {
  success: boolean;
  newBlocks: PushableBlock[];
};

type Axis = { dx: number; dy: number };

// Huong "lon them" cua tung resize handle, quy ve 1-2 truc di chuyen. Vi du
// "e" (keo canh phai ra) chi lon sang phai (dx:1); "se" (keo goc duoi-phai)
// lon ca sang phai LAN xuong duoi - thu truc dau tien (dx) truoc, dy sau, vi
// spec vi du "resize sang phai -> day sang phai tiep" uu tien truc CHINH cua
// huong keo.
const GROWTH_AXES: Record<ResizeDirection, Axis[]> = {
  e: [{ dx: 1, dy: 0 }],
  w: [{ dx: -1, dy: 0 }],
  n: [{ dx: 0, dy: -1 }],
  s: [{ dx: 0, dy: 1 }],
  ne: [{ dx: 1, dy: 0 }, { dx: 0, dy: -1 }],
  nw: [{ dx: -1, dy: 0 }, { dx: 0, dy: -1 }],
  se: [{ dx: 1, dy: 0 }, { dx: 0, dy: 1 }],
  sw: [{ dx: -1, dy: 0 }, { dx: 0, dy: 1 }],
};

// Fallback CUOI CUNG khi khong tim duoc cho theo huong resize - spec: "nếu
// không được thì xuống dưới", ap dung cho MOI huong resize (ke ca khi truc
// chinh da la "xuong duoi" thi fallback nay chi lap lai vo hai, khong sai).
const FALLBACK_AXIS: Axis = { dx: 0, dy: 1 };

// Quet tung buoc (step=1,2,3,...) doc theo 1 truc, tra ve vi tri TRONG dau
// tien (khong dam vao obstacles, khong vuot bien luoi) - hoac null neu het
// duong (vuot bien truoc khi tim duoc cho).
function findNearestFreeSlot(
  block: PushableBlock,
  axis: Axis,
  obstacles: GridRect[],
): PushableBlock | null {
  if (axis.dx === 0 && axis.dy === 0) return null;
  const maxSteps = axis.dx !== 0 ? GRID_COLS : GRID_ROWS;

  for (let step = 1; step <= maxSteps; step++) {
    const candidate: PushableBlock = {
      ...block,
      gridX: block.gridX + axis.dx * step,
      gridY: block.gridY + axis.dy * step,
    };
    if (
      candidate.gridX < 0 ||
      candidate.gridY < 0 ||
      candidate.gridX + candidate.gridW > GRID_COLS ||
      candidate.gridY + candidate.gridH > GRID_ROWS
    ) {
      return null;
    }
    if (!checkCollision(candidate, obstacles)) {
      return candidate;
    }
  }
  return null;
}

// Day cac block bi block dang resize (resizedBlock, RECT MOI da tinh san)
// de lai cho o cho - moi block bi de duoc thu tim 1 vi tri TRONG CUNG kich
// thuoc, DOC THEO huong resize truoc, roi "xuong duoi" neu huong do khong
// duoc. KHONG cascade da tang (block bi day chi can khong dam vao
// resizedBlock/cac block khac - KHONG tu dong day tiep 1 block thu 3 chi vi
// no dam vao block VUA duoc day, no chi don gian bi loai khoi vi tri do va
// vong lap tiep tuc quet xa hon). 1 block KHONG tim duoc cho -> toan bo
// pushBlocks THAT BAI (success:false, newBlocks = otherBlocks nguyen ban,
// KHONG ap dung push nao ca - caller phai revert toan bo resize).
export function pushBlocks(
  resizedBlock: PushableBlock,
  otherBlocks: PushableBlock[],
  direction: ResizeDirection,
): PushResult {
  const colliding = otherBlocks.filter((b) => checkCollision(resizedBlock, [b]));
  if (colliding.length === 0) {
    return { success: true, newBlocks: otherBlocks };
  }

  const axes = [...GROWTH_AXES[direction], FALLBACK_AXIS];
  const updated = [...otherBlocks];

  for (const block of colliding) {
    const obstacles: GridRect[] = [
      resizedBlock,
      ...updated.filter((b) => b.id !== block.id),
    ];

    let placed: PushableBlock | null = null;
    for (const axis of axes) {
      placed = findNearestFreeSlot(block, axis, obstacles);
      if (placed) break;
    }

    if (!placed) {
      return { success: false, newBlocks: otherBlocks };
    }

    const idx = updated.findIndex((b) => b.id === block.id);
    updated[idx] = placed;
  }

  return { success: true, newBlocks: updated };
}
