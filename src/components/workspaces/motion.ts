// Spring dung chung cho MOI panel truot vao (sidebar, ArticleDetailPanel,
// ArticleReaderPane's ArticleSidebar) - xem docs/workspace-style-guide.md
// muc 5: "khong tu che 1 spring config khac cho moi panel".
export const PANEL_SPRING = {
  type: "spring",
  stiffness: 420,
  damping: 32,
  mass: 0.65,
} as const;
