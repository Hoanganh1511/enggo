// Nen anh bau troi/dao noi DUNG CHUNG cho CA cay /workspace/[username]/**
// (man chon workspace LAN man chi tiet workspace/doc bai - [workspaceId],
// [workspaceId]/[slug]) - dat o day (layout.tsx, ap dung cho moi route con)
// la CO CHU DICH lan nay, khac voi WorkspaceHubChrome.tsx (toolbar/banner/
// context CHI danh cho man chon workspace, dat trong page.tsx cua dung
// segment do de KHONG lo xuong route con - xem docs/engineering-log.md).
// Server Component thuan (khong can "use client", khong co hook/state).
export default function WorkspaceAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative h-full">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 mask-[linear-gradient(to_bottom,#000_55%,transparent_92%)]"
        style={{
          backgroundImage: "url(/assets/images/workspaces/workspace-bg.png)",
          backgroundSize: "cover",
          backgroundPosition: "right top",
          backgroundColor: "var(--background)",
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
