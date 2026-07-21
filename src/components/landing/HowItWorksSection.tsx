import { howItWorks } from "@/content/landing";
import TreeDemo from "./TreeDemo";

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="text-center text-2xl font-semibold text-ink sm:text-3xl">
        Cách hoạt động — chỉ 3 bước
      </h2>
      <div className="mt-12 flex flex-col gap-16">
        {howItWorks.map((item) => (
          <div key={item.step} className="grid items-center gap-8 md:grid-cols-2">
            <div className="flex flex-col gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                {item.step}
              </span>
              <h3 className="text-xl font-medium text-ink">{item.title}</h3>
              <p className="text-sm text-ink-muted">{item.description}</p>
            </div>
            <div className="rounded-2xl border border-border bg-surface-muted p-6">
              <TreeDemo highlight={item.highlight} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorksSection;
