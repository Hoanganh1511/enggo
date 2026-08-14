// Nen cho man Workspace (list + workspace phase, dung o
// workspace/[username]/layout.tsx, nam duoi ca noi dung - xem layering trong
// layout.tsx). Luoi cham/duong ke mo kieu Linear/Vercel, thay cho ban "deep
// space" (sao + nebula) truoc day - doi theo yeu cau nguoi dung, dung dung
// var(--background)/var(--border) de tu thich ung sang/toi thay vi hardcode
// #f8fafc/#e2e8f0. mask-image bo tron+mo dan luoi ra rim man hinh (giu
// nguyen tu spec nguoi dung dua, khong phai token vi khong lien quan mau
// sac). Khong con animation/hook nao nen KHONG can "use client".
//
// Luu y: TransformModal/ControlCenterReactor/WorkspaceGatewayOverlay van CO
// CHU DICH giu bang mau cyan/violet toi co dinh (xem comment "dong bo voi
// StarfieldBackground" trong cac file do) - gio nen da doi sang luoi sang,
// 3 component do se KHONG con dong bo tong mau voi nen nua (van dung, chi la
// "hon dao" toi rieng khi xuat hien, vd luc mo modal Tao workspace). Chua
// sua lai vi ngoai pham vi yeu cau nay.
export default function StarfieldBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full mask-[radial-gradient(ellipse_70%_60%_at_50%_0%,#000_60%,transparent_100%)]"
      style={{
        background: "var(--background)",
        backgroundImage:
          "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
        backgroundSize: "20px 30px",
      }}
    />
  );
}
