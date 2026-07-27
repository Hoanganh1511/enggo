// Sidebar gio nam trong luong flex binh thuong (khong con "fixed" full-height
// nua) nen khu vuc noi dung chinh khong can dong bo margin-left voi trang
// thai collapse cua Sidebar nua - chi con la 1 div padding tinh.
const MainContentArea = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-0 flex-1 overflow-auto pt-1 pb-4 px-4">
      {children}
    </div>
  );
};

export default MainContentArea;
