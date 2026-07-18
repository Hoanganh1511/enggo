export type ApiNode = {
  id: string;
  workspaceId: string;
  parentId: string | null;
  title: string;
  depth: number;
  orderIndex: number;
  hiddenFromShare: boolean;
  isCollapsed: boolean;
  content: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  cardCount: number;
  lastActivity: string | null;
};

// Workspace tree list responses omit `content` (Tiptap JSON can be large and is
// never rendered outside the node's own detail modal) — this is the shape held
// in memory for the whole tree at all times. Use `ApiNode` (with `content`)
// only for a single node fetched on demand, e.g. via `getNode`.
export type ApiNodeListItem = Omit<ApiNode, "content">;

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
