import MainContentArea from "@/components/shell/main-content-area";
import TopHeaderBar from "@/components/shell/TopHeaderBar";
import { ChatMessageToastStack } from "@/components/chat/ChatMessageToastStack";
import FeedBootstrap from "@/lib/discover/FeedBootstrap";

// Layout 1 cot: header ngang CO DINH tren cung (TopHeaderBar.tsx, port layout
// note.com theo yeu cau nguoi dung) + noi dung ben duoi - thay AppSidebar.tsx
// (sidebar trai) da xoa. "Trang chủ" toi tu link Logo trong header, "Workspace"
// chuyen vao AccountMenu (dropdown avatar) - "Khám phá"/"Đã lưu" (2 flyout cu
// cua AppSidebar) KHONG con noi hien vi ban than 2 cai do da la placeholder
// rong (khong co du lieu/route that) tu truoc, bo di khong mat chuc nang gi.
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <FeedBootstrap />
      <TopHeaderBar />
      <ChatMessageToastStack />
      <MainContentArea>{children}</MainContentArea>
    </>
  );
};

export default Layout;
