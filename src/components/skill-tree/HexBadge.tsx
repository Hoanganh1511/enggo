import type { NodeStatus } from "@/lib/career-tree/node-status";
import { getStatusStyle, hexToRgba } from "@/lib/skill-tree/status-style";

const HEX_POINTS = "50,3 93,26 93,74 50,97 7,74 7,26";

type HexBadgeProps = {
  size: number;
  status: NodeStatus;
  children: React.ReactNode;
};

// Badge icon hinh luc giac (outline mong) cho SkillCard/SkillDetailPanel - ve
// bang SVG polygon (khong dung clip-path tren mot div co border, vi clip-path
// cat border theo hinh chu nhat goc, khien vien khong theo duoc cac canh cheo
// cua hinh luc giac va trong vo net). Knowledge Blocks dung Hex3DBadge.tsx
// (badge co chieu sau/gradient/sparkle) thay vi component nay.
const HexBadge = ({ size, status, children }: HexBadgeProps) => {
  const hex = getStatusStyle(status).hex;
  return (
    <div
      className="relative shrink-0"
      style={{
        width: size,
        height: size,
        filter: `drop-shadow(0 0 8px ${hexToRgba(hex, 0.35)})`,
      }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <polygon
          points={HEX_POINTS}
          fill={hexToRgba(hex, 0.14)}
          stroke={hex}
          strokeWidth={2.5}
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ color: hex }}
      >
        {children}
      </div>
    </div>
  );
};

export default HexBadge;
