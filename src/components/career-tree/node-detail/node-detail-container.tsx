"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Folder, FileText, Target } from "lucide-react";
import NodeDetailView from "./NodeDetailView";
import type { Activity } from "./ActivityLog";
import { getNodeCardsAction } from "@/actions/career-tree/get-node-cards";
import { createCardAction } from "@/actions/career-tree/create-card";
import { createNodeAction } from "@/actions/career-tree/create-node";
import { deleteNodeAction } from "@/actions/career-tree/delete-node";
import { updateNodeContentAction } from "@/actions/career-tree/update-node-content";
import { extractPlainText } from "@/lib/career-tree/extract-plain-text";
import { MAX_EXPECTED_CARDS } from "@/lib/career-tree/constants";
import { getNodeResourcesAction } from "@/actions/career-tree/get-node-resources"; // không cần nếu chỉ dùng initial, có thể bỏ import này
import { createResourceAction } from "@/actions/career-tree/create-resource-action";
import { deleteResourceAction } from "@/actions/career-tree/delete-resource-action";
import type {
  ApiCard,
  ApiNode,
  ApiNodeListItem,
  ApiResource,
  ResourceType,
} from "@/lib/api/types";
import type { NodeRole } from "@/lib/career-tree/types";
const PAGE_SIZE = 20;

function toActivity(card: ApiCard): Activity {
  return {
    id: card.id,
    text: extractPlainText(card.content) || "Trống",
    time: card.createdAt,
  };
}

const ROLE_ICON: Record<NodeRole, typeof Target> = {
  root: Target,
  branch: Folder,
  leaf: FileText,
};

type NodeDetailContainerProps = {
  workspaceId: string;
  node: ApiNode;
  role: NodeRole;
  childrenCount: number;
  childNodes: ApiNodeListItem[];
  initialCards: ApiCard[];
  initialResources: ApiResource[];
};

const NodeDetailContainer = ({
  workspaceId,
  node,
  role,
  childrenCount,
  childNodes,
  initialCards,
  initialResources,
}: NodeDetailContainerProps) => {
  const router = useRouter();
  const [resources, setResources] = useState<ApiResource[]>(initialResources);
  const [activitiesState, setActivitiesState] = useState({
    activities: initialCards.map(toActivity),
    cursor: initialCards.at(-1)?.id ?? null,
    hasMore: initialCards.length === PAGE_SIZE,
  });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const contentDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleAddResource = async (data: {
    type: ResourceType;
    title: string;
    url: string;
  }) => {
    const resource = await createResourceAction(workspaceId, node.id, data);
    setResources((prev) => [...prev, resource]);
  };
  const handleDeleteResource = async (resourceId: string) => {
    await deleteResourceAction(workspaceId, resourceId);
    setResources((prev) => prev.filter((r) => r.id !== resourceId));
  };

  const handleAddActivity = async (text: string) => {
    const card = await createCardAction(workspaceId, node.id, {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text }] }],
    });
    setActivitiesState((prev) => ({
      ...prev,
      activities: [
        { id: card.id, text, time: card.createdAt },
        ...prev.activities,
      ],
    }));
  };

  const handleLoadMore = async () => {
    if (!activitiesState.hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    const cards = await getNodeCardsAction(node.id, {
      cursor: activitiesState.cursor ?? undefined,
      limit: PAGE_SIZE,
    });
    setActivitiesState((prev) => ({
      activities: [...prev.activities, ...cards.map(toActivity)],
      cursor: cards.at(-1)?.id ?? prev.cursor,
      hasMore: cards.length === PAGE_SIZE,
    }));
    setIsLoadingMore(false);
  };

  const handleContentChange = (json: Record<string, unknown>) => {
    if (contentDebounceRef.current) clearTimeout(contentDebounceRef.current);
    contentDebounceRef.current = setTimeout(() => {
      updateNodeContentAction(workspaceId, node.id, json);
    }, 500);
  };

  const handleAddChild = (name: string) => {
    createNodeAction(workspaceId, node.id, name);
  };

  const handleDelete = () => {
    deleteNodeAction(workspaceId, node.id);
    router.push(`/w/${workspaceId}`);
  };

  return (
    <NodeDetailView
      workspaceId={workspaceId}
      childNodes={childNodes}
      node={{
        id: node.id,
        icon: ROLE_ICON[role],
        title: node.title,
        subtitle: `${node.cardCount} ghi chú`,
        branches: childrenCount,
        done: Math.min(node.cardCount, MAX_EXPECTED_CARDS),
        total: MAX_EXPECTED_CARDS,
        content: node.content,
        activities: activitiesState.activities,
        hasMoreActivities: activitiesState.hasMore,
        isLoadingMoreActivities: isLoadingMore,
        updatedAt: node.updatedAt,
      }}
      onContentChange={handleContentChange}
      onAddChild={handleAddChild}
      onDelete={handleDelete}
      onAddActivity={handleAddActivity}
      onLoadMoreActivities={handleLoadMore}
      resources={resources}
      onAddResource={handleAddResource}
      onDeleteResource={handleDeleteResource}
    />
  );
};

export default NodeDetailContainer;
