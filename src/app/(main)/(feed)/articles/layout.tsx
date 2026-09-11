import { redirect } from "next/navigation";

// /articles - KHOA HOAN TOAN (khong phai chi chan chua dang nhap nua - lan
// truoc lam vay nhung nguoi dung xac nhan van muon chan LUON ca nguoi da
// dang nhap, trang nay coi nhu chua san sang ra mat). Redirect /home VO
// DIEU KIEN, khong con check session - moi tai khoan (ke ca chinh chu) deu
// khong vao duoc qua URL truc tiep. Da an luon muc "Articles" khoi sidebar
// (xem HomeDashboardSidebar.tsx) de khong con loi dan vao day tu UI nua.
export default function ArticlesLayout() {
  redirect("/home");
}
