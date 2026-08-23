import MainContentArea from "@/components/shell/main-content-area";
import TopHeaderBar from "@/components/shell/TopHeaderBar";
import { ChatMessageToastStack } from "@/components/chat/ChatMessageToastStack";
import FeedBootstrap from "@/lib/discover/FeedBootstrap";

// Layout: header ngang CO DINH tren cung (TopHeaderBar.tsx) + noi dung ben
// duoi. Sidebar doc (MainSidebar.tsx) da BO khoi layout nay theo yeu cau
// nguoi dung - file component van con, chi khong con duoc dung o day (chua
// xoa han, phong truong hop can dung lai sau).
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <FeedBootstrap />
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-white">
        {/* Nen luoi caro chung cho TOAN BO trang trong app (truoc day chi ve
            rieng o HomeHero.tsx cho /home) - fixed + -z-10 de nam co dinh phia
            sau moi noi dung, khong cuon theo MainContentArea. */}
        <div
          className="pointer-events-none fixed inset-0 -z-10"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)",
            backgroundSize: "3px 3px",
          }}
        />
        <TopHeaderBar />
        <ChatMessageToastStack />
        <MainContentArea>{children}</MainContentArea>
      </div>
    </>
  );
};

export default Layout;
