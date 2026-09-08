// Trang thai rong dung chung trong khu vuc Home Dashboard (category/article/
// roadmap/activity truoc day moi noi tu viet 1 <p> rieng, cung 1 kieu chu -
// gom lai tranh lap code + le drift style neu sua 1 cho quen cho con lai).
export function EmptyState({ message }: { message: string }) {
  return <p className="py-6 text-center text-[13px] text-slate-400">{message}</p>;
}
