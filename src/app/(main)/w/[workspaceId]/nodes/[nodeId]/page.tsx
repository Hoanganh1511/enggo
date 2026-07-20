import { notFound } from "next/navigation";
import NodeDetailContainer from "@/components/career-tree/node-detail/node-detail-container";
import { getNode, getWorkspaceTree } from "@/lib/api/nodes";
import { getNodeCards } from "@/lib/api/cards";
import { getNodeResources } from "@/lib/api/resources";
import { getNodeIssues } from "@/lib/api/issues";
import { resolveNodeRole } from "@/lib/career-tree/types";
import { getRealChildrenCount } from "@/lib/career-tree/filter-visible-nodes";
const CARDS_PAGE_SIZE = 20;

type PageProps = {
  params: Promise<{ workspaceId: string; nodeId: string }>;
};

export default async function NodeDetailPage({ params }: PageProps) {
  const { workspaceId, nodeId } = await params;

  const [node, allNodes, initialCards, initialResources, initialIssues] =
    await Promise.all([
      getNode(workspaceId, nodeId).catch(() => null),
      getWorkspaceTree(workspaceId),
      getNodeCards(nodeId, { limit: CARDS_PAGE_SIZE }),
      getNodeResources(nodeId),
      getNodeIssues(nodeId),
    ]);

  if (!node) notFound();

  // allNodes (từ findTreeForWorkspace) mới có cardCount/practiceCount/... đã
  // rollup con->cha; getNode() chỉ trả field thô của riêng node đó. Merge lại
  // để tránh "undefined ghi chú"/"NaN/20" ở trang chi tiết.
  const nodeSummary = allNodes.find((n) => n.id === nodeId);
  const fullNode = nodeSummary
    ? { ...nodeSummary, content: node.content }
    : node;

  const childrenCount = getRealChildrenCount(allNodes).get(nodeId) ?? 0;
  const role = resolveNodeRole(fullNode, childrenCount > 0);
  const childNodes = allNodes
    .filter((n) => n.parentId === nodeId)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <NodeDetailContainer
      workspaceId={workspaceId}
      node={fullNode}
      role={role}
      childrenCount={childrenCount}
      childNodes={childNodes}
      initialCards={initialCards}
      initialResources={initialResources}
      initialIssues={initialIssues}
    />
  );
}
