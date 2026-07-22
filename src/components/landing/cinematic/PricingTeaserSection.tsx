import { Check } from "lucide-react";
import { pricingTeaser, hero } from "@/content/landing";
import LoginModal from "../LoginModal";

const PricingTeaserSection = () => {
  return (
    <section id="pricing" className="mx-auto max-w-4xl px-6 py-16">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {pricingTeaser.headline}
        </h2>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {pricingTeaser.plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-2xl border p-6 backdrop-blur-xl ${
              plan.highlighted
                ? "border-blue-400/40 bg-linear-to-b from-blue-500/10 to-violet-500/10 shadow-[0_0_40px_rgba(59,130,246,0.15)]"
                : "border-white/10 bg-white/[0.04]"
            }`}
          >
            {plan.highlighted && (
              <span className="absolute -top-3 left-6 rounded-full bg-linear-to-r from-blue-500 to-violet-500 px-3 py-1 text-[10px] font-semibold text-white">
                Sắp ra mắt
              </span>
            )}
            <h3 className="text-sm font-medium text-slate-300">{plan.name}</h3>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white">{plan.price}</span>
              <span className="text-sm text-slate-500">{plan.period}</span>
            </div>
            <p className="mt-3 text-sm text-slate-400">{plan.description}</p>
            <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
              <Check size={14} className="text-emerald-400" />
              Không giới hạn số node
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <LoginModal
          triggerLabel={hero.ctaPrimaryLabel}
          triggerClassName="cursor-pointer rounded-full bg-linear-to-r from-blue-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_30px_rgba(99,102,241,0.45)] transition-transform duration-150 ease-out hover:scale-[1.03]"
        />
      </div>
    </section>
  );
};

export default PricingTeaserSection;
