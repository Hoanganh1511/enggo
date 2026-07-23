import { notFound } from "next/navigation";
import SkillTreePage from "@/components/skill-tree/SkillTreePage";
import { getWorkspaceTree } from "@/lib/api/nodes";
import { getWorkspaceCategories } from "@/lib/api/categories";
import { getWorkspace, listWorkspaces } from "@/lib/api/workspaces";

type PageProps = {
  params: Promise<{ workspaceId: string; categoryId: string }>;
};

// Trang chi tiet 1 Knowledge Block (= 1 Category) - tai dung nguyen
// SkillTreePage (canvas/toolbar/detail panel khong doi), chi truyen vao
// dung 1 category thay vi ca danh sach.
export default async function Page({ params }: PageProps) {
  const { workspaceId, categoryId } = await params;
  const [workspace, workspaces, categories, nodes] = await Promise.all([
    getWorkspace(workspaceId),
    listWorkspaces(),
    getWorkspaceCategories(workspaceId),
    getWorkspaceTree(workspaceId),
  ]);

  const category = categories.find((c) => c.id === categoryId);
  if (!category) notFound();

  return (
    <SkillTreePage
      workspace={workspace}
      workspaces={workspaces}
      categories={[category]}
      nodes={nodes}
    />
  );
}
