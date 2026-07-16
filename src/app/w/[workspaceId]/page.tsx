import CareerTreeWorkspace from "@/components/career-tree/career-tree-workspace";
import { getWorkspaceTree } from "@/lib/api/nodes";

type PageProps = {
  params: Promise<{ workspaceId: string }>;
};
export default async function WorkspacePage({ params }: PageProps) {
  const { workspaceId } = await params;
  const nodes = await getWorkspaceTree(workspaceId);
  return <CareerTreeWorkspace workspaceId={workspaceId} initialNodes={nodes} />;
}
