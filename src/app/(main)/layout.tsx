import Sidebar from "@/components/career-tree/sidebar";
import TopHeaderBar from "@/components/career-tree/top-header-bar";
import CareerTreeProvider from "@/lib/career-tree/career-tree-context";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <CareerTreeProvider>
      <TopHeaderBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        {children}
      </div>
    </CareerTreeProvider>
  );
};

export default Layout;
