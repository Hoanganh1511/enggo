import MainContentArea from "@/components/shell/main-content-area";
import TopHeaderBar from "@/components/shell/TopHeaderBar";
import { MainSidebar } from "@/components/shell/MainSidebar";
import { ChatMessageToastStack } from "@/components/chat/ChatMessageToastStack";
import FeedBootstrap from "@/lib/discover/FeedBootstrap";

// Layout: sidebar icon doc CO DINH ben trai (MainSidebar.tsx, THEM MOI theo
// yeu cau nguoi dung sau nay) + cot phai gom header ngang CO DINH tren cung
// (TopHeaderBar.tsx, port layout note.com theo yeu cau nguoi dung TRUOC DO) +
// noi dung ben duoi. Ca 2 sidebar/header cung ton tai song song (khong cai
// nao thay the cai nao) - xem comment trong MainSidebar.tsx ve lich su
// AppSidebar.tsx cu da bi xoa roi gio them lai duoi dang khac.
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <FeedBootstrap />
      <div className="flex min-h-0 flex-1">
        <MainSidebar />
        <div className="flex min-h-0 flex-1 flex-col">
          <TopHeaderBar />
          <ChatMessageToastStack />
          <MainContentArea>{children}</MainContentArea>
        </div>
      </div>
    </>
  );
};

export default Layout;
