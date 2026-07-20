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
import { updateNodeAction } from "@/actions/career-tree/update-node";
import { updateNodeContentAction } from "@/actions/career-tree/update-node-content";
import { createResourceAction } from "@/actions/career-tree/create-resource-action";
import { deleteResourceAction } from "@/actions/career-tree/delete-resource-action";
import { createIssueAction } from "@/actions/career-tree/create-issue-action";
import { updateIssueAction } from "@/actions/career-tree/update-issue-action";
import { deleteIssueAction } from "@/actions/career-tree/delete-issue-action";
import { extractPlainText } from "@/lib/career-tree/extract-plain-text";
import { MAX_EXPECTED_CARDS } from "@/lib/career-tree/constants";
import type {
  ApiCard,
  ApiIssue,
  ApiNode,
  ApiNodeListItem,
  ApiResource,
  CardKind,
  ResourceType,
} from "@/lib/api/types";
import type { NodeRole } from "@/lib/career-tree/types";
const PAGE_SIZE = 20;

function toActivity(card: ApiCard): Activity {
  return {
    id: card.id,
    text: extractPlainText(card.content) || "Trống",
    time: card.createdAt,
    kind: card.kind,
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
  initialIssues: ApiIssue[];
};

const NodeDetailContainer = ({
  workspaceId,
  node,
  role,
  childrenCount,
  childNodes,
  initialCards,
  initialResources,
  initialIssues,
}: NodeDetailContainerProps) => {
  const router = useRouter();
  const [resources, setResources] = useState<ApiResource[]>(initialResources);
  const [issues, setIssues] = useState<ApiIssue[]>(initialIssues);
  const [activitiesState, setActivitiesState] = useState({
    activities: initialCards.map(toActivity),
    cursor: initialCards.at(-1)?.id ?? null,
    hasMore: initialCards.length === PAGE_SIZE,
  });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const contentDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const goalDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const handleAddIssue = async (question: string) => {
    const issue = await createIssueAction(workspaceId, node.id, question);
    setIssues((prev) => [...prev, issue]);
  };
  const handleToggleIssue = async (issueId: string, resolved: boolean) => {
    const issue = await updateIssueAction(workspaceId, issueId, { resolved });
    setIssues((prev) => prev.map((i) => (i.id === issueId ? issue : i)));
  };
  const handleDeleteIssue = async (issueId: string) => {
    await deleteIssueAction(workspaceId, issueId);
    setIssues((prev) => prev.filter((i) => i.id !== issueId));
  };

  const handleAddActivity = async (text: string, kind: CardKind) => {
    const card = await createCardAction(
      workspaceId,
      node.id,
      {
        type: "doc",
        content: [{ type: "paragraph", content: [{ type: "text", text }] }],
      },
      kind,
    );
    setActivitiesState((prev) => ({
      ...prev,
      activities: [
        { id: card.id, text, time: card.createdAt, kind: card.kind },
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

  const handleGoalChange = (goal: string) => {
    if (goalDebounceRef.current) clearTimeout(goalDebounceRef.current);
    goalDebounceRef.current = setTimeout(() => {
      updateNodeAction(workspaceId, node.id, { goal });
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
        goal: node.goal,
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
      onGoalChange={handleGoalChange}
      onAddChild={handleAddChild}
      onDelete={handleDelete}
      onAddActivity={handleAddActivity}
      onLoadMoreActivities={handleLoadMore}
      resources={resources}
      onAddResource={handleAddResource}
      onDeleteResource={handleDeleteResource}
      issues={issues}
      onAddIssue={handleAddIssue}
      onToggleIssue={handleToggleIssue}
      onDeleteIssue={handleDeleteIssue}
    />
  );
};

export default NodeDetailContainer;
