import { Check, Flame } from "lucide-react";

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[13px]">
      <span className="flex items-center gap-2 text-slate-600">
        <Check size={13} className="text-blue-500" aria-hidden="true" />
        {label}
      </span>
      <span className="font-semibold text-[#162033]">{value}</span>
    </div>
  );
}

// Thay the "Today's goal" (checkbox todo hardcode trong source, khong co
// bang du lieu that dung sau) - so lieu THAT tu journey (streak/so ngay hoc/
// so muc da hieu), read-only, khong con la checklist tuong tac gia. Xem
// docs/home-dashboard-style-guide.md muc 16.
export function HomeWeeklyProgressCard({
  currentStreak,
  totalStudyDays,
  totalUnderstood,
}: {
  currentStreak: number;
  totalStudyDays: number;
  totalUnderstood: number;
}) {
  return (
    <div className="rounded-xl border border-[#edf0f4] bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-bold">Tiến độ tuần này</h2>
        <Flame size={16} className="text-orange-400" aria-hidden="true" />
      </div>
      <div className="font-content mt-4 space-y-3">
        <StatRow label="Chuỗi ngày học liên tục" value={`${currentStreak} ngày`} />
        <StatRow label="Tổng ngày học (nhóm hiện tại)" value={`${totalStudyDays} ngày`} />
        <StatRow label="Mục đã hiểu" value={`${totalUnderstood}`} />
      </div>
    </div>
  );
}
