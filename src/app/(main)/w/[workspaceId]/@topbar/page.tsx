import CanvasTopbar from "@/components/career-tree/canvas-topbar";
import { getWorkspace, listWorkspaces } from "@/lib/api/workspaces";

type PageProps = {
  params: Promise<{ workspaceId: string }>;
};

export default async function CanvasTopbarSlot({ params }: PageProps) {
  const { workspaceId } = await params;
  const [workspace, workspaces] = await Promise.all([
    getWorkspace(workspaceId),
    listWorkspaces(),
  ]);

  return <CanvasTopbar workspace={workspace} workspaces={workspaces} />;
}
