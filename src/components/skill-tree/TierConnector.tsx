import type { NodeStatus } from "@/lib/career-tree/node-status";
import { getStatusStyle } from "@/lib/skill-tree/status-style";

// Phai khop chieu cao 1 hang skill card ("md") + gap-4 giua cac hang trong
// tier column (SkillTreeCanvas.tsx) de duong noi thang hang voi tung the -
// AddSkillCard.tsx cung dung h-19 (76px) co dinh lam chuan chung.
const ROW_HEIGHT = 76;
const ROW_GAP = 16;

type TierConnectorProps = {
  // Trang thai cua tung skill trong TIER TRUOC (cot ben trai), theo dung thu
  // tu tren-xuong - moi hang 1 duong noi rieng, mau theo status cua no, chay
  // ngang sang cot Tier ke tiep (khac ban row-based cu: 1 "cau" dung chung).
  statuses: NodeStatus[];
};

const TierConnector = ({ statuses }: TierConnectorProps) => {
  if (statuses.length === 0) return <div className="w-10 shrink-0" />;

  return (
    <div className="flex w-10 shrink-0 flex-col" style={{ gap: ROW_GAP }}>
      {statuses.map((status, i) => (
        <div
          key={i}
          className="flex items-center justify-center"
          style={{ height: ROW_HEIGHT }}
        >
          <div
            className="h-0.5 w-full rounded-full"
            style={{ background: getStatusStyle(status).hex, opacity: 0.6 }}
          />
        </div>
      ))}
    </div>
  );
};

export default TierConnector;
