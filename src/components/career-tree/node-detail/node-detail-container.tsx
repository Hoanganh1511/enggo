"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Folder, FileText, Target } from "lucide-react";
import NodeDetailView, { type SaveStatus } from "./NodeDetailView";
import NodePathSidebar from "./NodePathSidebar";
import type { Activity } from "./ActivityLog";
import { buildAncestorPath } from "@/lib/career-tree/node-path";
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
  Difficulty,
  NodeKind,
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
  allNodes: ApiNodeListItem[];
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
  allNodes,
  initialCards,
  initialResources,
  initialIssues,
}: NodeDetailContainerProps) => {
  const router = useRouter();
  const ancestorPath = buildAncestorPath(allNodes, node.id);
  const parentName =
    ancestorPath.length >= 2 ? ancestorPath[ancestorPath.length - 2].title : null;
  const branchName = ancestorPath.length >= 2 ? ancestorPath[1].title : null;
  const [resources, setResources] = useState<ApiResource[]>(initialResources);
  const [issues, setIssues] = useState<ApiIssue[]>(initialIssues);
  const [activitiesState, setActivitiesState] = useState({
    activities: initialCards.map(toActivity),
    cursor: initialCards.at(-1)?.id ?? null,
    hasMore: initialCards.length === PAGE_SIZE,
  });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const contentDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const goalDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const categoryDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const estimatedTimeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveStatusResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const markSaved = () => {
    setSaveStatus("saved");
    if (saveStatusResetRef.current) clearTimeout(saveStatusResetRef.current);
    saveStatusResetRef.current = setTimeout(() => setSaveStatus("idle"), 2000);
  };

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
    setSaveStatus("saving");
    contentDebounceRef.current = setTimeout(async () => {
      await updateNodeContentAction(workspaceId, node.id, json);
      markSaved();
    }, 500);
  };

  const handleGoalChange = (goal: string) => {
    if (goalDebounceRef.current) clearTimeout(goalDebounceRef.current);
    setSaveStatus("saving");
    goalDebounceRef.current = setTimeout(async () => {
      await updateNodeAction(workspaceId, node.id, { goal });
      markSaved();
    }, 500);
  };

  const handleAddChild = (name: string, kind: NodeKind) => {
    createNodeAction(workspaceId, node.id, name, kind);
  };

  const handleKindChange = async (kind: NodeKind) => {
    setSaveStatus("saving");
    await updateNodeAction(workspaceId, node.id, { kind });
    markSaved();
  };

  const handleCategoryChange = (category: string) => {
    if (categoryDebounceRef.current) clearTimeout(categoryDebounceRef.current);
    setSaveStatus("saving");
    categoryDebounceRef.current = setTimeout(async () => {
      await updateNodeAction(workspaceId, node.id, { category });
      markSaved();
    }, 500);
  };

  const handleDifficultyChange = async (difficulty: Difficulty) => {
    setSaveStatus("saving");
    await updateNodeAction(workspaceId, node.id, { difficulty });
    markSaved();
  };

  const handleEstimatedTimeChange = (estimatedTime: string) => {
    if (estimatedTimeDebounceRef.current)
      clearTimeout(estimatedTimeDebounceRef.current);
    setSaveStatus("saving");
    estimatedTimeDebounceRef.current = setTimeout(async () => {
      await updateNodeAction(workspaceId, node.id, { estimatedTime });
      markSaved();
    }, 500);
  };

  const handleLearningOutcomesChange = async (learningOutcomes: string[]) => {
    setSaveStatus("saving");
    await updateNodeAction(workspaceId, node.id, { learningOutcomes });
    markSaved();
  };

  const handlePrerequisitesChange = async (prerequisites: string[]) => {
    setSaveStatus("saving");
    await updateNodeAction(workspaceId, node.id, { prerequisites });
    markSaved();
  };

  const handleDelete = () => {
    deleteNodeAction(workspaceId, node.id);
    router.push(`/w/${workspaceId}`);
  };

  return (
    <div className="flex h-full w-full">
      <NodePathSidebar workspaceId={workspaceId} ancestorPath={ancestorPath} />
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
          createdAt: node.createdAt,
          lastActivity: node.lastActivity,
          streak: node.streak,
          kind: node.kind,
          category: node.category,
          difficulty: node.difficulty,
          estimatedTime: node.estimatedTime,
          prerequisites: node.prerequisites,
          learningOutcomes: node.learningOutcomes,
          cardCount: node.cardCount,
          parentId: node.parentId,
        }}
        parentName={parentName}
        branchName={branchName}
        saveStatus={saveStatus}
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
        onKindChange={handleKindChange}
        onCategoryChange={handleCategoryChange}
        onDifficultyChange={handleDifficultyChange}
        onEstimatedTimeChange={handleEstimatedTimeChange}
        onLearningOutcomesChange={handleLearningOutcomesChange}
        onPrerequisitesChange={handlePrerequisitesChange}
      />
    </div>
  );
};

export default NodeDetailContainer;
