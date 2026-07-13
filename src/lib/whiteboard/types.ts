import type { Edge, Node } from "@xyflow/react";

export type BoardNodeData = {
  title: string;
  description?: string;
};

export type ParentBoardNode = Node<BoardNodeData, "parentBoard">;
export type ChildBoardNode = Node<BoardNodeData, "childBoard">;

export type AppNode = ParentBoardNode | ChildBoardNode;
export type AppEdge = Edge;
