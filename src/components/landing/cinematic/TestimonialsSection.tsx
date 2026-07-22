import { Quote } from "lucide-react";
import { testimonials } from "@/content/landing";

const TestimonialsSection = () => {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Người dùng nói gì
        </h2>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-3">
        {testimonials.map((t) => (
          <div
            key={t.name}
            className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl"
          >
            <Quote className="h-5 w-5 text-blue-400/70" strokeWidth={1.75} />
            <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-300">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-500/30 to-violet-500/30 text-xs font-semibold text-white">
                {t.name.charAt(0)}
              </span>
              <div>
                <p className="text-xs font-medium text-white">{t.name}</p>
                <p className="text-[11px] text-slate-500">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;
