import Link from "next/link";
import { getWorkspace } from "@/lib/api/workspaces";
import { getWorkspaceTree } from "@/lib/api/nodes";

type PageProps = {
  params: Promise<{ workspaceId: string; nodeId: string }>;
};

export default async function NodeDetailTopbarSlot({ params }: PageProps) {
  const { workspaceId, nodeId } = await params;
  // Dùng getWorkspaceTree (không có content) thay vì getNode — chỉ cần đúng
  // title cho breadcrumb, không cần kéo theo nội dung rich-text nặng của node.
  const [workspace, allNodes] = await Promise.all([
    getWorkspace(workspaceId),
    getWorkspaceTree(workspaceId),
  ]);
  const node = allNodes.find((n) => n.id === nodeId);

  return (
    <header className="bg-surface px-8 2xl:px-10 py-6 2xl:py-6">
      <nav className="flex items-center gap-1.5 text-xs">
        <Link
          href={`/w/${workspaceId}`}
          className="text-ink-muted transition-colors duration-150 ease-out hover:text-ink"
        >
          {workspace.name}
        </Link>
        {node && (
          <>
            <span className="text-ink-disabled">/</span>
            <span className="truncate font-medium text-ink">{node.title}</span>
          </>
        )}
      </nav>
    </header>
  );
}
