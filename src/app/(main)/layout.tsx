import MainContentArea from "@/components/shell/main-content-area";
import AppSidebar from "@/components/shell/AppSidebar";
import FeedBootstrap from "@/lib/discover/FeedBootstrap";

// Layout 2 cot: AppSidebar trai CO DINH cao het man hinh + noi dung. Header
// ngang cu (top-header-bar.tsx, chi con search/accountSlot sau khi nav
// chuyen het sang AppSidebar.tsx) da XOA HAN theo yeu cau nguoi dung -
// current-user.tsx (chi ton tai de wire CurrentUser vao header do) xoa theo,
// AccountMenu/Avatar trong account-menu.tsx VAN GIU (Avatar dang dung o
// AppSidebar.tsx cho the profile) - CurrentUser/AccountMenu(default export)
// dropdown Profile/Cai dat/Log out hien khong con noi goi, "Cài đặt" da co
// duong rieng qua sidebar (trang /settings tu co nut Log out).
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <FeedBootstrap />
      <div className="flex gap-x-2 min-h-0 flex-1 p-2">
        <AppSidebar />
        <MainContentArea>{children}</MainContentArea>
      </div>
    </>
  );
};

export default Layout;
