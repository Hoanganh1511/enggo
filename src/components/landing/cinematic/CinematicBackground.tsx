// Nen nhieu lop dung chung cho toan bo landing page (Layer 1-9 theo spec):
// navy gradient -> radial glow -> mesh gradient -> luoi cham blueprint ->
// duong ket noi phat sang -> wave mesh -> hat sang troi -> noise -> vignette.
// Toan bo dung CSS/SVG thuan (khong canvas/WebGL) de nhe va de bao tri; 1
// instance duy nhat, "fixed" de dung yen khi cuon trang, cac section chi can
// nen trong suot ben tren.
const PARTICLES = [
  { top: "8%", left: "12%", size: 2, delay: "0s", duration: "7s" },
  { top: "18%", left: "82%", size: 1.5, delay: "1.2s", duration: "9s" },
  { top: "32%", left: "24%", size: 2, delay: "2.1s", duration: "8s" },
  { top: "44%", left: "68%", size: 1.5, delay: "0.6s", duration: "10s" },
  { top: "58%", left: "8%", size: 2, delay: "3s", duration: "7.5s" },
  { top: "66%", left: "48%", size: 1.5, delay: "1.8s", duration: "9.5s" },
  { top: "74%", left: "88%", size: 2, delay: "0.3s", duration: "8.5s" },
  { top: "84%", left: "30%", size: 1.5, delay: "2.6s", duration: "11s" },
  { top: "12%", left: "55%", size: 1.5, delay: "1.4s", duration: "8s" },
  { top: "92%", left: "70%", size: 2, delay: "3.4s", duration: "9s" },
];

const CinematicBackground = () => {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#05070d]">
      {/* Layer 1: navy gradient nen */}
      <div className="absolute inset-0 bg-linear-to-b from-[#070a14] via-[#05070d] to-[#03040a]" />

      {/* Layer 2: radial glow lon */}
      <div className="absolute top-[-10%] left-[8%] h-[560px] w-[560px] rounded-full bg-blue-600/25 blur-[140px]" />
      <div className="absolute top-[10%] right-[4%] h-[480px] w-[480px] rounded-full bg-violet-600/20 blur-[130px]" />
      <div className="absolute bottom-[-8%] left-[30%] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-[120px]" />

      {/* Layer 3: mesh gradient (khoi conic mo) */}
      <div
        className="absolute top-[20%] left-1/2 h-[900px] w-[1400px] -translate-x-1/2 opacity-30 blur-[100px]"
        style={{
          background:
            "conic-gradient(from 180deg at 50% 50%, #3b82f6 0deg, #8b5cf6 120deg, #22d3ee 220deg, #3b82f6 360deg)",
        }}
      />

      {/* Layer 4: luoi cham blueprint, mo dan ra mep */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(148,163,184,0.6) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 90%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 90%)",
        }}
      />

      {/* Layer 5: duong ket noi phat sang */}
      <svg
        className="absolute inset-0 h-full w-full opacity-40"
        preserveAspectRatio="none"
        viewBox="0 0 1440 1600"
        fill="none"
      >
        <defs>
          <linearGradient id="glow-line-1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0" />
            <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="glow-line-2" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
            <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M100 120 C 400 250, 700 50, 1050 220 S 1500 400, 1300 620"
          stroke="url(#glow-line-1)"
          strokeWidth="1.5"
        />
        <path
          d="M1380 80 C 1100 300, 1200 520, 850 640 S 300 780, 200 1020"
          stroke="url(#glow-line-2)"
          strokeWidth="1.5"
        />
        <path
          d="M0 900 C 300 1000, 600 850, 900 1000 S 1300 1200, 1440 1100"
          stroke="url(#glow-line-1)"
          strokeWidth="1.5"
        />
      </svg>

      {/* Layer 7: hat sang troi, twinkle nhe */}
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-cyan-200/70"
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            animation: `cinematic-twinkle ${p.duration} ease-in-out ${p.delay} infinite`,
          }}
        />
      ))}

      {/* Layer 8: noise texture rat nhe */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Layer 9: vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, transparent 40%, rgba(3,4,10,0.7) 100%)",
        }}
      />
    </div>
  );
};

export default CinematicBackground;
