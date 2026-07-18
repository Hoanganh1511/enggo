import CareerTreeHeader from "@/components/career-tree/career-tree-header";

type LayoutProps = {
  children: React.ReactNode;
  topbar: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
};

export default async function WorkspaceLayout({
  children,
  topbar,
  params,
}: LayoutProps) {
  const { workspaceId } = await params;

  return (
    <CareerTreeHeader workspaceId={workspaceId} topbar={topbar}>
      {children}
    </CareerTreeHeader>
  );
}
