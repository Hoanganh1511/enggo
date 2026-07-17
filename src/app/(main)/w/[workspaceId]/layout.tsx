import CareerTreeHeader from "@/components/career-tree/career-tree-header";
import { getWorkspace, listWorkspaces } from "@/lib/api/workspaces";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
};

export default async function WorkspaceLayout({
  children,
  params,
}: LayoutProps) {
  const { workspaceId } = await params;
  const [workspace, workspaces] = await Promise.all([
    getWorkspace(workspaceId),
    listWorkspaces(),
  ]);

  return (
    <CareerTreeHeader
      workspaceId={workspaceId}
      workspace={workspace}
      workspaces={workspaces}
    >
      {children}
    </CareerTreeHeader>
  );
}
