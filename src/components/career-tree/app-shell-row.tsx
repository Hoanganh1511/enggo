import type { ReactNode } from "react";

type AppShellRowProps = {
  sidebar: ReactNode;
  children: ReactNode;
};

// Hang chua Sidebar + noi dung chinh. Moi trang trong (main) - ke ca /home -
// deu dung full chieu rong man hinh (khong max-width rieng nua), padding
// ngang dong nhat da chuyen vao MainContentArea (xem main-content-area.tsx).
const AppShellRow = ({ sidebar, children }: AppShellRowProps) => {
  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      {sidebar}
      {children}
    </div>
  );
};

export default AppShellRow;
