type SparklineProps = {
  values: number[];
  color: string;
  width?: number;
  height?: number;
};

// Duong xu huong nho (1 chuoi duy nhat -> khong can chu thich/truc, dung quy
// uoc sparkline chuan: net mong 2px, dau tron, khong luoi). Mau lay theo mau
// "danh tinh" cua chinh hang do (giong Knowledge Block), khong phai mau lap
// lai giua cac hang.
const Sparkline = ({
  values,
  color,
  width = 64,
  height = 24,
}: SparklineProps) => {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = 2;

  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * (width - pad * 2) + pad;
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return `${x},${y}`;
  });

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      className="shrink-0"
    >
      <polyline
        points={points.join(" ")}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Sparkline;
