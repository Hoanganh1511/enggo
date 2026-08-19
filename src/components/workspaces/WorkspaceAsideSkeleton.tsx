// Khung card RONG, DUNG kich thuoc/style voi aside that (ArticleReaderPane.tsx,
// ArticleDetailPanel.tsx) - dung lam "cho giu cho" trong luc chuyen tiep
// (WorkspaceBrowseView.tsx luc sap dieu huong sang bai viet, VA loading.tsx
// cua route [slug] trong luc cho) de bo cuc 2 cot KHONG nhay/doi be rong giua
// cac buoc chuyen tiep - chi noi dung BEN TRONG doi (rong -> spinner -> that),
// khung ben ngoai giu nguyen vi tri/kich thuoc.
export function WorkspaceAsideSkeleton() {
  return (
    <div
      className="shadow-panel flex w-90 shrink-0 flex-col overflow-hidden rounded-[13px] backdrop-blur-md"
      style={{
        border: "1px solid var(--border)",
        background: "color-mix(in srgb, var(--surface) 82%, transparent)",
      }}
    />
  );
}
