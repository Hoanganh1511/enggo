import CareerTreeCanvas from "@/components/career-tree/career-tree-canvas";
import { getWorkspaceTree } from "@/lib/api/nodes";

type PageProps = {
  params: Promise<{ workspaceId: string }>;
};
export default async function WorkspacePage({ params }: PageProps) {
  const { workspaceId } = await params;
  const initialNodes = await getWorkspaceTree(workspaceId);
  return (
    <CareerTreeCanvas workspaceId={workspaceId} initialNodes={initialNodes} />
  );
}
