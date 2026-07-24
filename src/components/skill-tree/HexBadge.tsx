import type { NodeStatus } from "@/lib/career-tree/node-status";
import { getStatusStyle, hexToRgba } from "@/lib/skill-tree/status-style";

const HEX_POINTS = "50,3 93,26 93,74 50,97 7,74 7,26";

type HexBadgeProps = {
  size: number;
  // "status" (mac dinh, SkillCard/SkillDetailPanel dang dung) lay mau tu
  // NodeStatus - GIU NGUYEN hanh vi cu, khong doi gi cho 2 noi nay. "colorHex"
  // la mau rieng KHONG theo status (vd mau "danh tinh" cua 1 Knowledge Block -
  // xem lib/skill-tree/block-accent.ts), uu tien hon status neu co ca 2.
  status?: NodeStatus;
  colorHex?: string;
  // "bold" = fill dam + icon trang (dung cho card lon nhu KnowledgeBlockCard,
  // can noi bat) thay vi outline mong mac dinh (dung cho SkillCard nho hon).
  bold?: boolean;
  children: React.ReactNode;
};

// Badge icon hinh luc giac - ve bang SVG polygon (khong dung clip-path tren
// mot div co border, vi clip-path cat border theo hinh chu nhat goc, khien
// vien khong theo duoc cac canh cheo cua hinh luc giac va trong vo net).
const HexBadge = ({
  size,
  status,
  colorHex,
  bold = false,
  children,
}: HexBadgeProps) => {
  const hex = colorHex ?? (status ? getStatusStyle(status).hex : "#64748b");
  return (
    <div
      className="relative shrink-0"
      style={{
        width: size,
        height: size,
        filter: `drop-shadow(0 0 8px ${hexToRgba(hex, bold ? 0.5 : 0.35)})`,
      }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <polygon
          points={HEX_POINTS}
          fill={hexToRgba(hex, bold ? 0.85 : 0.14)}
          stroke={hex}
          strokeWidth={bold ? 1.5 : 2.5}
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ color: bold ? "#ffffff" : hex }}
      >
        {children}
      </div>
    </div>
  );
};

export default HexBadge;
