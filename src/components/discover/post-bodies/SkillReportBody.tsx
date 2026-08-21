import { ChevronRight, Layers } from "lucide-react";
import type { Post } from "@/content/home-feed-mock";

type SkillReportPost = Extract<Post, { kind: "skill-report" }>;

// Style "giay note" (nen am, goc gap giay) thay vi the trang trung tinh - day
// la nhat ky hoc tap ca nhan, muon cam giac thu cong/gan gui hon la 1 "bao
// cao" cung nhac. Breadcrumb {workspaceName} > {categoryName} > {nodeTitle}
// dung dung mau accent that cua Knowledge Block (post.categoryAccent). Day
// deu la du lieu BAI DANG DA LUU (khong con nut "Xem chi tiet" fetch them tu
// Skill Tree - tinh nang do da bi xoa, khong con nguon du lieu that de fetch
// them ngoai nhung gi da luu trong post).
export function SkillReportBody({ post }: { post: SkillReportPost }) {
  return (
    <div className="relative mt-2 flex flex-col gap-2.5 overflow-hidden rounded-md border border-amber-200/70 bg-amber-50 p-4 shadow-sm">
        {/* Goc giay gap - hieu ung note that dan tren mat ban, thuan CSS
            border-trick. Mau dung tong amber DAM HON nen (gia lam "mat sau"
            to giay) + shadow nho tao chieu sau - dung black/10 phang se ra
            vet xam nhat trong nhu loi hien thi tren nen sang. */}
        <span
          aria-hidden
          className="pointer-events-none absolute top-0 right-0 h-0 w-0 border-t-16 border-r-16 border-t-amber-200 border-r-transparent shadow-[-1px_1px_2px_rgba(0,0,0,0.12)]"
        />

        <div className="flex min-w-0 flex-wrap items-center gap-1 text-xs text-amber-900/60">
          <Layers
            size={12}
            strokeWidth={2}
            className="shrink-0"
            style={{ color: post.categoryAccent }}
          />
          <span className="truncate">{post.workspaceName}</span>
          <ChevronRight size={11} strokeWidth={2} className="shrink-0" />
          <span className="truncate">{post.categoryName}</span>
          <ChevronRight size={11} strokeWidth={2} className="shrink-0" />
          <span
            className="truncate font-semibold"
            style={{ color: post.categoryAccent }}
          >
            {post.nodeTitle}
          </span>
        </div>

        <p className="text-sm wrap-break-word text-amber-950/80">
          {post.content}
        </p>
    </div>
  );
}
