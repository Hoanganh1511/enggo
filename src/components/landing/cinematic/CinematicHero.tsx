import {
  Plus,
  Play,
  CreditCard,
  Clock,
  RefreshCw,
  Sparkles,
  Target,
  Folder,
  Award,
} from "lucide-react";
import { hero, heroCards } from "@/content/landing";
import { cn } from "@/lib/utils";
import LoginModal from "../LoginModal";
import FloatingKnowledgeCard from "./FloatingKnowledgeCard";

const TRUST_ICON = [CreditCard, Clock, RefreshCw];

const CinematicHero = () => {
  return (
    <section className="relative mx-auto max-w-7xl px-6 pt-20 pb-16 lg:pt-28">
      <div className="grid items-center gap-16 lg:grid-cols-2">
        {/* Cot trai */}
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300 backdrop-blur-md">
            <Sparkles size={12} className="text-blue-400" />
            {hero.badge}
          </span>

          <h1 className="mt-6 text-4xl leading-[1.1] font-bold tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
            Nhìn thấy sự{" "}
            <span className="bg-linear-to-r from-blue-400 via-blue-300 to-cyan-300 bg-clip-text text-transparent">
              trưởng thành
            </span>{" "}
            của bạn,{" "}
            <span className="bg-linear-to-r from-violet-400 via-fuchsia-300 to-violet-300 bg-clip-text text-transparent">
              không chỉ ghi chú nó
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-base text-slate-400 sm:text-lg">
            {hero.subheadline}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <LoginModal
              triggerLabel={hero.ctaPrimaryLabel}
              triggerClassName="group flex cursor-pointer items-center gap-2 rounded-full bg-linear-to-r from-blue-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_30px_rgba(99,102,241,0.45)] transition-transform duration-150 ease-out hover:scale-[1.03]"
            />
            <a
              href={hero.ctaSecondary.href}
              className="flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-slate-200 backdrop-blur-md transition-colors duration-150 ease-out hover:bg-white/5"
            >
              {hero.ctaSecondary.label}
              <Play size={14} />
            </a>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            {hero.trustBadges.map((label, i) => {
              const Icon = TRUST_ICON[i % TRUST_ICON.length];
              return (
                <span
                  key={label}
                  className="flex items-center gap-1.5 text-xs text-slate-500"
                >
                  <Icon size={13} strokeWidth={1.75} />
                  {label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Cot phai: moi card tu co transform 3D rieng (rotateX/Y/Z +
            translateZ), KHONG dung "san khau" chung nua - nhung lan nay an
            toan vi 3 card KHONG chong lan nhau (khoang cach top 150px >
            chieu cao card ~130px), nen z-index thu tu nao cung khong che
            chu card khac. Transform dat qua Tailwind arbitrary property
            (khong phai inline style) de "group-hover:[...]" ghi de duoc -
            inline style transform luon thang class nen se chan mat hover
            neu dung inline. */}
        <div
          className="relative mx-auto hidden lg:block"
          style={{ width: 340, height: 440, perspective: "1400px" }}
        >
          {/* Rim light: xanh duong trai, tim phai, xanh la duoi - chieu sang
              quanh cum card thay vi chi dua vao glow nen chung toan trang. */}
          <span className="pointer-events-none absolute top-6 -left-8 h-48 w-48 rounded-full bg-blue-500/25 blur-[90px]" />
          <span className="pointer-events-none absolute top-40 -right-8 h-48 w-48 rounded-full bg-violet-500/25 blur-[90px]" />
          <span className="pointer-events-none absolute bottom-0 left-8 h-36 w-48 rounded-full bg-emerald-500/15 blur-[80px]" />

          {/* Vai hat sang lop tien canh, rieng cho cum card (khac voi hat
              sang nen dung chung toan trang o CinematicBackground). */}
          <span
            className="absolute top-4 left-6 h-1 w-1 rounded-full bg-white/70"
            style={{
              animation: "cinematic-twinkle 6s ease-in-out 0.5s infinite",
            }}
          />
          <span
            className="absolute top-64 right-16 h-1.5 w-1.5 rounded-full bg-cyan-200/70"
            style={{
              animation: "cinematic-twinkle 7s ease-in-out 2s infinite",
            }}
          />
          <span
            className="absolute top-36 left-2 h-1 w-1 rounded-full bg-violet-200/70"
            style={{
              animation: "cinematic-twinkle 8s ease-in-out 3.2s infinite",
            }}
          />

          {/* Duong noi bezier mem noi khoang trong giua cac card (khong con
              chong lan nen khong can kieu "hook" nhu ban truoc). */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
            viewBox="0 0 340 440"
            fill="none"
          >
            <path
              d="M60 90 C 20 120, 20 140, 45 165"
              stroke="#60a5fa"
              strokeOpacity="0.45"
              strokeWidth="1.5"
            />
            <path
              d="M190 240 C 150 265, 150 280, 175 305"
              stroke="#60a5fa"
              strokeOpacity="0.45"
              strokeWidth="1.5"
            />
          </svg>

          {/* Card 1 */}
          <div
            className={cn(
              "absolute w-[270px] [transform-style:preserve-3d] transition-transform duration-500",
              "transform-[rotateX(12deg)_rotateY(-14deg)_rotateZ(-4deg)_translateZ(40px)]",
              "hover:transform-[rotateX(8deg)_rotateY(-9deg)_rotateZ(-3deg)_translateZ(60px)_translateY(-4px)]",
            )}
            style={{ top: 0, left: 35, zIndex: 3 }}
          >
            <FloatingKnowledgeCard
              icon={Target}
              title="Sự nghiệp của tôi"
              meta="12 ghi chú · 3 nhánh"
              score={heroCards[0].score}
              mastery={heroCards[0].mastery}
              accent="blue"
            />
          </div>

          {/* Card 2 */}
          <div
            className={cn(
              "absolute w-[270px] [transform-style:preserve-3d] transition-transform duration-500",
              "transform-[rotateX(10deg)_rotateY(-10deg)_rotateZ(-3deg)_translateZ(15px)]",
              "hover:transform-[rotateX(7deg)_rotateY(-7deg)_rotateZ(-2deg)_translateZ(30px)_translateY(-4px)]",
            )}
            style={{ top: 150, left: 5, zIndex: 2 }}
          >
            <FloatingKnowledgeCard
              icon={Folder}
              title="Backend"
              meta="9 ghi chú · 3 nhánh"
              score={heroCards[1].score}
              mastery={heroCards[1].mastery}
              accent="emerald"
            />
          </div>

          {/* Card 3 */}
          <div
            className={cn(
              "absolute w-[270px] [transform-style:preserve-3d] transition-transform duration-500",
              "transform-[rotateX(9deg)_rotateY(-12deg)_rotateZ(-4deg)_translateZ(-10px)]",
              "hover:transform-[rotateX(6deg)_rotateY(-8deg)_rotateZ(-3deg)_translateZ(5px)_translateY(-4px)]",
            )}
            style={{ top: 300, left: 45, zIndex: 1 }}
          >
            <FloatingKnowledgeCard
              icon={Award}
              title="System Design"
              meta="7 ghi chú · 2 nhánh"
              score={heroCards[2].score}
              mastery={heroCards[2].mastery}
              accent="violet"
            />
          </div>

          <button
            type="button"
            className="absolute bottom-0 left-1/2 flex h-10 -translate-x-1/2 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-slate-300 backdrop-blur-md transition-colors duration-150 ease-out hover:bg-white/10"
            aria-label="Thêm node mới"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default CinematicHero;
