import { notFound } from "next/navigation";
import NodeDetailContainer from "@/components/career-tree/node-detail/node-detail-container";
import { getNode, getWorkspaceTree } from "@/lib/api/nodes";
import { getNodeCards } from "@/lib/api/cards";
import { resolveNodeRole } from "@/lib/career-tree/types";
import { getRealChildrenCount } from "@/lib/career-tree/filter-visible-nodes";
import { getNodeResources } from "@/lib/api/resources";
const CARDS_PAGE_SIZE = 20;

type PageProps = {
  params: Promise<{ workspaceId: string; nodeId: string }>;
};

export default async function NodeDetailPage({ params }: PageProps) {
  const { workspaceId, nodeId } = await params;

  const [node, allNodes, initialCards, initialResources] = await Promise.all([
    getNode(workspaceId, nodeId).catch(() => null),
    getWorkspaceTree(workspaceId),
    getNodeCards(nodeId, { limit: CARDS_PAGE_SIZE }),
    getNodeResources(nodeId),
  ]);

  if (!node) notFound();

  const childrenCount = getRealChildrenCount(allNodes).get(nodeId) ?? 0;
  const role = resolveNodeRole(node, childrenCount > 0);
  const childNodes = allNodes
    .filter((n) => n.parentId === nodeId)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <NodeDetailContainer
      workspaceId={workspaceId}
      node={node}
      role={role}
      childrenCount={childrenCount}
      childNodes={childNodes}
      initialCards={initialCards}
      initialResources={initialResources}
    />
  );
}
