import Spinner from "@/components/ui/spinner";

// Suspense fallback luc dieu huong toi trang quan ly (bam nut Settings o
// sidebar/danh sach Series) - truoc day KHONG co loading.tsx nen chuyen
// trang khong hien gi ca cho toi khi fetch xong, nguoi dung tuong bam khong
// an thua (yeu cau nguoi dung bao loi thieu spinner).
export default function SeriesManageLoading() {
  return (
    <div className="flex h-full flex-1 items-center justify-center py-20">
      <Spinner size={24} />
    </div>
  );
}
