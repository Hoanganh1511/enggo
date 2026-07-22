import { ctaFinal } from "@/content/landing";
import LoginModal from "../LoginModal";

const FinalCtaSection = () => {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-blue-500/10 via-violet-500/10 to-transparent p-10 text-center backdrop-blur-xl sm:p-14">
        <span className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-500/20 blur-[100px]" />
        <h2 className="relative text-2xl font-bold text-white sm:text-3xl">
          {ctaFinal.headline}
        </h2>
        <p className="relative mt-3 text-sm text-slate-400">
          Gia nhập cùng hàng ngàn lập trình viên đang phát triển mỗi ngày.
        </p>
        <div className="relative mt-7 flex justify-center">
          <LoginModal
            triggerLabel={`${ctaFinal.ctaLabel} ngay`}
            triggerClassName="group flex cursor-pointer items-center gap-2 rounded-full bg-linear-to-r from-blue-500 to-violet-500 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-transform duration-150 ease-out hover:scale-[1.03]"
          />
        </div>
      </div>
    </section>
  );
};

export default FinalCtaSection;
