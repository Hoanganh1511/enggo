import type { AppEdge, AppNode } from "./types";

export const initialNodes: AppNode[] = [
  {
    id: "parent-a",
    type: "parentBoard",
    position: { x: 120, y: 80 },
    data: { title: "Bảng cha A", description: "Đặt tự do trên canvas" },
  },
  {
    id: "parent-b",
    type: "parentBoard",
    position: { x: 620, y: 80 },
    data: { title: "Bảng cha B", description: "Kéo thả vị trí khác" },
  },
  {
    id: "child-1",
    type: "childBoard",
    position: { x: 60, y: 320 },
    data: { title: "Bảng con 1" },
  },
  {
    id: "child-2",
    type: "childBoard",
    position: { x: 300, y: 340 },
    data: { title: "Bảng con 2" },
  },
];

export const initialEdges: AppEdge[] = [
  { id: "e-parent-a-child-1", source: "parent-a", target: "child-1" },
  { id: "e-parent-a-child-2", source: "parent-a", target: "child-2" },
];
