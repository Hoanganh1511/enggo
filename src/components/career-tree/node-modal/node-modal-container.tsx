"use client";

import { useEffect, useRef, useState } from "react";
import { Folder, FileText, Target } from "lucide-react";
import NodeModal from "./NodeModal";
import type { Activity } from "./ActivityLog";
import { getNodeCardsAction } from "@/actions/career-tree/get-node-cards";
import { createCardAction } from "@/actions/career-tree/create-card";
import { createNodeAction } from "@/actions/career-tree/create-node";
import { deleteNodeAction } from "@/actions/career-tree/delete-node";
import { updateNodeAction } from "@/actions/career-tree/update-node";
import { extractPlainText } from "@/lib/career-tree/extract-plain-text";
import { MAX_EXPECTED_CARDS } from "@/lib/career-tree/constants";
import type { ApiNode } from "@/lib/api/types";
import type { NodeRole } from "@/lib/career-tree/types";

const ROLE_ICON: Record<NodeRole, typeof Target> = {
  root: Target,
  branch: Folder,
  leaf: FileText,
};

type NodeModalContainerProps = {
  workspaceId: string;
  node: ApiNode;
  role: NodeRole;
  childrenCount: number;
  onClose: () => void;
};

const NodeModalContainer = ({
  workspaceId,
  node,
  role,
  childrenCount,
  onClose,
}: NodeModalContainerProps) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const contentDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    getNodeCardsAction(node.id).then((cards) => {
      if (cancelled) return;
      setActivities(
        cards.map((c) => ({
          id: c.id,
          text: extractPlainText(c.content) || "(trống)",
          time: c.createdAt,
        })),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [node.id]);

  const handleAddActivity = async (text: string) => {
    const card = await createCardAction(workspaceId, node.id, {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text }] }],
    });
    setActivities((prev) => [{ id: card.id, text, time: card.createdAt }, ...prev]);
  };

  const handleContentChange = (json: Record<string, unknown>) => {
    if (contentDebounceRef.current) clearTimeout(contentDebounceRef.current);
    contentDebounceRef.current = setTimeout(() => {
      updateNodeAction(workspaceId, node.id, { content: json });
    }, 500);
  };

  const handleAddChild = (name: string) => {
    createNodeAction(workspaceId, node.id, name);
  };

  const handleDelete = () => {
    deleteNodeAction(workspaceId, node.id);
    onClose();
  };

  return (
    <NodeModal
      open
      onClose={onClose}
      node={{
        id: node.id,
        icon: ROLE_ICON[role],
        title: node.title,
        subtitle: `${node.cardCount} ghi chú`,
        branches: childrenCount,
        done: Math.min(node.cardCount, MAX_EXPECTED_CARDS),
        total: MAX_EXPECTED_CARDS,
        content: node.content,
        activities,
        updatedAt: node.updatedAt,
      }}
      onContentChange={handleContentChange}
      onAddChild={handleAddChild}
      onDelete={handleDelete}
      onAddActivity={handleAddActivity}
    />
  );
};

export default NodeModalContainer;
