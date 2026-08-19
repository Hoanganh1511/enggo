"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { WorkspaceMain } from "./WorkspaceMain";
import { ArticleDetailPanel } from "./ArticleDetailPanel";
import { WorkspaceOverviewPanel } from "./WorkspaceOverviewPanel";
import { WorkspaceAsideSkeleton } from "./WorkspaceAsideSkeleton";
import { useWorkspaceShell } from "./workspace-shell-context";

// Noi dung trang browse (danh sach nhom da o WorkspaceSidebar, day chi con
// ArticleList + ArticleDetailPanel) - doc toan bo du lieu tu
// WorkspaceShellContext (nhom dang chon, danh sach bai viet) thay vi nhan
// qua props nhu WorkspaceDetail.tsx cu, vi trang nay va trang doc bai viet
// ([slug]/page.tsx) la 2 route KHAC NHAU, khong con la 2 nhanh render trong
// CUNG 1 component nua.
export function WorkspaceBrowseView() {
  const { workspace, username, selectedGroup, groupDocs, groupDocsLoading, panelsReady } =
    useWorkspaceShell();
  const router = useRouter();

  // Chon 1 nhom (tu KnowledgeGroupCatalog.tsx) gio LUON dieu huong thang toi
  // bai viet MOI NHAT cua nhom do (thay vi dung o man danh sach BranchStage
  // cu - da xoa, danh sach chuyen het sang GroupArticleToc.tsx trai) - dung
  // "moi nhat" = updatedAt moi nhat, KHOP dung thu tu mac dinh cua chinh
  // danh sach do (sort "Mới cập nhật"), tranh lech giua "bai o dau list" va
  // "bai duoc mo tu dong". Component nay CHI mount o trang browse (page.tsx)
  // - sang trang doc bai ([slug]/page.tsx) la unmount, nen khong lap lai
  // redirect khi dang doc/chuyen bai qua GroupArticleToc.
  useEffect(() => {
    if (!selectedGroup || groupDocsLoading || groupDocs.length === 0) return;
    const newest = [...groupDocs].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
    router.replace(`/workspace/${username}/${workspace.id}/${newest.slug}`);
  }, [selectedGroup, groupDocs, groupDocsLoading, username, workspace.id, router]);

  // Ngay khi biet SE dieu huong (docs da tai xong VA co bai) - thay
  // ArticleDetailPanel (du lieu THAT: postCount/nut "Viết bài mới"...) bang 1
  // khung RONG cung kich thuoc (WorkspaceAsideSkeleton) thay vi an han (null)
  // - [slug]/loading.tsx dung CHUNG khung nay, nen ca chuoi chuyen tiep (browse
  // dang chon nhom -> dang dieu huong -> route [slug] dang tai -> bai viet
  // that) LUON giu dung 1 bo cuc 2 cot, khong bi nhay be rong/"tat bat" giua
  // cac buoc - dung phan hoi nguoi dung ("giữ nguyên panel, chỉ thêm loading").
  const redirecting =
    !!selectedGroup && !groupDocsLoading && groupDocs.length > 0;

  return (
    <>
      <WorkspaceMain
        group={selectedGroup}
        docs={groupDocs}
        loading={groupDocsLoading}
        panelsReady={panelsReady}
        username={username}
      />

      {/* Cot phai: tong quan NHOM dang chon, hoac tong quan CA WORKSPACE khi
          chua chon nhom nao (xem WorkspaceOverviewPanel.tsx) - luon co gi do
          o cot phai thay vi de trong khi dang o man tong quan. */}
      {redirecting ? (
        <WorkspaceAsideSkeleton />
      ) : selectedGroup ? (
        <ArticleDetailPanel group={selectedGroup} />
      ) : (
        <WorkspaceOverviewPanel />
      )}
    </>
  );
}
