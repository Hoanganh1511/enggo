import Sidebar from "@/components/career-tree/sidebar";
import TopHeaderBar from "@/components/career-tree/top-header-bar";

import { auth } from "@/auth";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();

  return (
    <>
      <TopHeaderBar user={session?.user} />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar />
        {children}
      </div>
    </>
  );
};

export default Layout;
