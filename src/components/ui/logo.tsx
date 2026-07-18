import { useId } from "react";

type LogoIconProps = {
  size?: number;
  className?: string;
  variant?: "gradient" | "mono";
};

// Icon mark: cây phân nhánh (tree) + node tròn ở đầu mỗi nhánh (network/knowledge
// graph) + ngôi sao ở đỉnh (mục tiêu sự nghiệp) — theo đúng ý nghĩa trong brand sheet.
export function LogoIcon({ size = 32, className, variant = "gradient" }: LogoIconProps) {
  const gradientId = useId();
  const stroke = variant === "gradient" ? `url(#${gradientId})` : "currentColor";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Tree Career"
    >
      {variant === "gradient" && (
        <defs>
          <linearGradient id={gradientId} x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>
      )}
      <g stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 29V22" />
        <path d="M16 22L8 18" />
        <path d="M16 22L24 18" />
        <path d="M16 22V18" />
        <path d="M16 18L11 13" />
        <path d="M16 18L21 13" />
      </g>
      <g fill={stroke}>
        <circle cx="8" cy="18" r="1.6" />
        <circle cx="24" cy="18" r="1.6" />
        <circle cx="11" cy="13" r="1.6" />
        <circle cx="21" cy="13" r="1.6" />
        <path d="M16 2.5L16.9 5.1L19.5 6L16.9 6.9L16 9.5L15.1 6.9L12.5 6L15.1 5.1Z" />
      </g>
    </svg>
  );
}

type LogoProps = {
  orientation?: "horizontal" | "vertical" | "icon-only";
  showTagline?: boolean;
  size?: number;
  variant?: "gradient" | "mono";
  className?: string;
};

const Logo = ({
  orientation = "horizontal",
  showTagline = false,
  size = 32,
  variant = "gradient",
  className,
}: LogoProps) => {
  if (orientation === "icon-only") {
    return <LogoIcon size={size} variant={variant} className={className} />;
  }

  const isVertical = orientation === "vertical";

  return (
    <div
      className={`flex ${isVertical ? "flex-col items-center gap-2 text-center" : "flex-row items-center gap-3"} ${className ?? ""}`}
    >
      <LogoIcon size={size} variant={variant} />
      <div className={`flex flex-col ${isVertical ? "items-center" : ""}`}>
        <span className="text-xl leading-tight font-semibold tracking-tight text-ink">
          Tree Career
        </span>
        {showTagline && (
          <span className="text-xs text-ink-muted">
            Grow your career, step by step.
          </span>
        )}
      </div>
    </div>
  );
};

export default Logo;
