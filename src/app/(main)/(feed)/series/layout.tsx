// Boc TOAN BO nhanh /series (list + new + [slug]/**) trong 1 class rieng
// (series-scope, xem globals.css) - font Inter/JetBrains Mono theo thiet ke
// rieng cua module nay, KHONG anh huong phan con lai cua app (van IBM Plex
// Mono, xem app/layout.tsx). Dat o day (goc nhanh series) thay vi tung layout
// con de dam bao AP DUNG DONG NHAT moi trang, ke ca /series/new va
// /series/[slug]/manage/** (2 cho nay hien khong co layout rieng nao ca).
export default function SeriesRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="series-scope contents">{children}</div>;
}
