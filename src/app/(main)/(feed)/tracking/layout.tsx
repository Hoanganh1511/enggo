import { redirect } from "next/navigation";

// /tracking - KHOA HOAN TOAN (khong phai chi chan chua dang nhap nua - lan
// truoc lam vay nhung nguoi dung xac nhan van muon chan LUON ca nguoi da
// dang nhap, khu vuc nay coi nhu chua san sang ra mat). Redirect /home VO
// DIEU KIEN, khong con check session - moi tai khoan (ke ca chinh chu) deu
// khong vao duoc qua URL truc tiep, ke ca 7 module con (accountability/
// analytics/daily/energy/goals/weekly/wellness - deu nam duoi layout nay nen
// tu dong bi chan theo). Da an luon muc "Tracking" khoi sidebar (xem
// HomeDashboardSidebar.tsx) de khong con loi dan vao day tu UI nua.
export default function TrackingLayout() {
  redirect("/home");
}
