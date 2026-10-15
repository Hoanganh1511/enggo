// [2026-10-15] Khung trang CHUNG cho moi route English Learner - cung ky
// thuat voi PlannerShell.tsx (-mx/-my huy padding cua FeedMainArea, workspace
// nay tu ve lai nen/le rieng) vi da an sidebar chinh cho khu vuc nay (xem
// use-main-sidebar-hidden.ts) - KHONG de lai khoang trong nhu con sidebar
// chiem cho. Max-width content column (lg:max-w-4xl) thay vi full-bleed nhu
// Planner - day la workspace DOC/HOC, can do rong dong doc thoai mai (spec
// muc 9: "Nội dung là trung tâm").
import { ElNav } from "./ElNav";

export function ElPageShell({
  children,
  wide = false,
}: {
  children: React.ReactNode;
  /** true = khong gioi han max-width (vd trang Practice/Test can khong gian
   *  thoai mai hon cho Matching 2 cot). */
  wide?: boolean;
}) {
  return (
    <div className="-mx-4 -my-6 min-h-full bg-background px-4 py-8 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
      <div className={wide ? "mx-auto max-w-5xl" : "mx-auto max-w-3xl"}>
        <ElNav />
        {children}
      </div>
    </div>
  );
}
