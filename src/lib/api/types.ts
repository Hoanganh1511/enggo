export type NodeKind = "BRANCH" | "TOPIC";
export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export type ApiNode = {
  id: string;
  workspaceId: string;
  parentId: string | null;
  goal: string | null;
  title: string;
  kind: NodeKind;
  category: string | null;
  difficulty: Difficulty | null;
  estimatedTime: string | null;
  prerequisites: string[];
  learningOutcomes: string[];
  depth: number;
  orderIndex: number;
  x: number | null;
  y: number | null;
  hiddenFromShare: boolean;
  isCollapsed: boolean;
  content: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  cardCount: number;
  practiceCount: number;
  resourceCount: number;
  openIssueCount: number;
  lastActivity: string | null;
  streak: {
    current: number;
    longest: number;
    last7: boolean[];
  };
};

// Workspace tree list responses omit `content` (Tiptap JSON can be large and is
// never rendered outside the node's own detail modal) — this is the shape held
// in memory for the whole tree at all times. Use `ApiNode` (with `content`)
// only for a single node fetched on demand, e.g. via `getNode`.
export type ApiNodeListItem = Omit<ApiNode, "content">;

export type CardKind = "NOTE" | "PRACTICE";

export type ApiCard = {
  id: string;
  nodeId: string;
  content: Record<string, unknown>;
  kind: CardKind;
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

export type ResourceType = "ARTICLE" | "VIDEO" | "DOC" | "COURSE" | "BOOK";

export type ApiResource = {
  id: string;
  nodeId: string;
  type: ResourceType;
  title: string;
  url: string;
  orderIndex: string;
  createdAt: string;
  updatedAt: string;
};

export type ApiIssue = {
  id: string;
  nodeId: string;
  question: string;
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NotificationType = "SYSTEM" | "CONNECTION";

export type ApiNotification = {
  id: string;
  workspaceId: string;
  type: NotificationType;
  title: string;
  body: string | null;
  read: boolean;
  createdAt: string;
  updatedAt: string;
};
