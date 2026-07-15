export type ApiNode = {
  id: string;
  workspaceId: string;
  parentId: string | null;
  title: string;
  depth: number;
  orderIndex: number;
  hiddenFromShare: boolean;
  isCollapsed: boolean;
  createdAt: string;
  updatedAt: string;
  cardCount: number;
  lastActivity: string | null;
};

export type ApiCard = {
  id: string;
  nodeId: string;
  content: Record<string, unknown>;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
};

export type ApiWorkspace = {
  id: string;
  name: string;
  shareToken: string | null;
  shareMode: "PRIVATE" | "STRUCTURE_ONLY" | "FULL";
  createdAt: string;
  updatedAt: string;
};
