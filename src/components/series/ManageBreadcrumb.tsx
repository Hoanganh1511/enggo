import Link from "next/link";

// Breadcrumb DUNG CHUNG cho toan bo khu vuc quan ly Series (manage/manage/
// entries/new/manage/entries/[entrySlug]) - yeu cau nguoi dung: "khi vào
// quản lý series và các trang con, page con trong đấy, hãy bổ sung
// breadcrumb để đi được những phần liên quan nữa" (truoc do MOI trang tu ve
// 1 link "Quay lại..."/"Xem trang công khai" RIENG LE, khong the nhay THANG
// tu vd trang sua Entry ve trang /series (danh sach) hay nguoc lai ve trang
// quan ly cua CHINH series do ma khong qua nhieu buoc bam). Dung tinh than
// giao dien y het breadcrumb o trang doc cong khai ([entrySlug]/page.tsx -
// nav aria-label="Breadcrumb", dau "/" ngan cach, mau ink-muted/hover ink) de
// dong bo 1 kieu breadcrumb DUY NHAT trong toan bo khu vuc Series. Muc CUOI
// CUNG (trang hien tai) LUON hien nhu VAN BAN THUONG (khong href, mau dam
// hon) - phan biet ro voi cac muc dieu huong duoc truoc no.
export function ManageBreadcrumb({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-4 flex flex-wrap items-center gap-1.5 text-[13px] text-ink-muted"
    >
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && (
            <span className="text-ink-faint" aria-hidden="true">
              /
            </span>
          )}
          {item.href ? (
            <Link href={item.href} className="hover:text-ink hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className={i === items.length - 1 ? "font-medium text-ink" : undefined}>
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
