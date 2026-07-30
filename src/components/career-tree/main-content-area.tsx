// Khu vuc noi dung chinh - nam ngay duoi TopHeaderBar trong layout 1 cot
// (xem (main)/layout.tsx). Khong con Sidebar nen khong phai dong bo
// margin-left voi thu gi ca, chi la 1 div padding tinh + vung cuon.
const MainContentArea = ({ children }: { children: React.ReactNode }) => {
  return <div className=" min-h-0 flex-1 overflow-auto pb-4">{children}</div>;
};

export default MainContentArea;
