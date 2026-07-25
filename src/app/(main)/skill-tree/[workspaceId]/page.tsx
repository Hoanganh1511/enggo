import KnowledgeBlocksPage from "@/components/skill-tree/KnowledgeBlocksPage";
import { getWorkspaceTree } from "@/lib/api/nodes";
import { getWorkspaceCategories } from "@/lib/api/categories";
import { getWorkspace, listWorkspaces } from "@/lib/api/workspaces";

type PageProps = {
  params: Promise<{ workspaceId: string }>;
};

// Trang tong quan Knowledge Blocks - luoi cac Category (block) trong
// workspace. Chi tiet 1 block rieng nam o skill-tree/[workspaceId]/[categoryId].
export default async function Page({ params }: PageProps) {
  const { workspaceId } = await params;
  const [workspace, workspaces, categories, nodes] = await Promise.all([
    getWorkspace(workspaceId),
    listWorkspaces(),
    getWorkspaceCategories(workspaceId),
    getWorkspaceTree(workspaceId),
  ]);

  return (
    <KnowledgeBlocksPage
      workspace={workspace}
      workspaces={workspaces}
      categories={categories}
      nodes={nodes}
    />
  );
}
