import { Folder, Brain, Sparkles, GitBranch, NotebookPen, Flame, Clock, MoreVertical } from "lucide-react";

type ProductPreviewCardProps = {
  title: string;
  meta: string;
  score: number;
  mastery: number;
  branches: number;
  notes: number;
  streak: number;
  insight: string;
  accent: "blue" | "emerald";
};

const ACCENT = {
  blue: { icon: "bg-blue-500/20 text-blue-300", score: "text-blue-300", bar: "from-blue-400 to-cyan-300" },
  emerald: { icon: "bg-emerald-500/20 text-emerald-300", score: "text-emerald-300", bar: "from-emerald-400 to-teal-300" },
};

// Mockup tinh, tai hien dung ngon ngu hinh anh cua GrowthCard that trong app
// (xem src/components/ui/growth-card.tsx) - dung cho landing page minh hoa
// san pham, khong phai component tuong tac that.
const ProductPreviewCard = ({
  title,
  meta,
  score,
  mastery,
  branches,
  notes,
  streak,
  insight,
  accent,
}: ProductPreviewCardProps) => {
  const s = ACCENT[accent];

  return (
    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.05] p-4 shadow-xl backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.icon}`}>
            <Folder size={15} strokeWidth={1.75} />
          </span>
          <div>
            <p className="text-sm font-medium text-white">{title}</p>
            <p className="text-[11px] text-slate-400">{meta}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-base font-semibold tabular-nums ${s.score}`}>{score}%</span>
          <MoreVertical size={14} className="text-slate-500" />
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-[10px] text-slate-500">
          <span>MASTERY</span>
          <span>{mastery}%</span>
        </div>
        <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full bg-linear-to-r ${s.bar}`}
            style={{ width: `${mastery}%` }}
          />
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.04] p-2.5">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-blue-300">
          <Brain size={12} strokeWidth={1.75} />
          AI Insight
          <Sparkles size={10} strokeWidth={1.75} />
        </div>
        <p className="mt-1 text-[11px] text-slate-400">{insight}</p>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-1.5">
        <div className="flex flex-col items-center gap-0.5 rounded-lg border border-white/10 py-1.5 text-center">
          <GitBranch size={12} className="text-slate-400" />
          <span className="text-xs font-semibold text-white">{branches}</span>
          <span className="text-[9px] text-slate-500">Nhánh</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 rounded-lg border border-white/10 py-1.5 text-center">
          <NotebookPen size={12} className="text-slate-400" />
          <span className="text-xs font-semibold text-white">{notes}</span>
          <span className="text-[9px] text-slate-500">Ghi chú</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 rounded-lg border border-white/10 py-1.5 text-center">
          <Flame size={12} className="text-orange-400" />
          <span className="text-xs font-semibold text-white">{streak}</span>
          <span className="text-[9px] text-slate-500">Streak</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 rounded-lg border border-white/10 py-1.5 text-center">
          <Clock size={12} className="text-slate-400" />
          <span className="text-[10px] font-semibold text-white">Vừa xong</span>
          <span className="text-[9px] text-slate-500">Học gần nhất</span>
        </div>
      </div>
    </div>
  );
};

export default ProductPreviewCard;
