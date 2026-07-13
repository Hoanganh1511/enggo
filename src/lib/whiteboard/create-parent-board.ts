import type { AppNode, ParentBoardNode } from "./types";

let counter = 0;

export const createParentBoard = (currentNodes: AppNode[]): ParentBoardNode => {
  const parentCount = currentNodes.filter(
    (node) => node.type === "parentBoard",
  ).length;

  //   Tính vị trí theo lưới 4 cột
  const col = parentCount % 4;
  const row = Math.floor(parentCount / 4);

  return {
    id: `parent-${Date.now()}-${counter++}`,
    type: "parentBoard",
    position: { x: 120 + col * 260, y: 80 + row * 220 },
    data: { title: `Bảng cha ${parentCount + 1}` },
  };
};

export default createParentBoard;
