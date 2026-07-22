import { features } from "@/content/landing";

const FeatureCardsSection = () => {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Vì sao chọn{" "}
          <span className="bg-linear-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            CareerTree
          </span>
        </h2>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition-colors duration-200 ease-out hover:border-white/20 hover:bg-white/[0.07]"
          >
            <span className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-blue-500/0 blur-2xl transition-colors duration-300 ease-out group-hover:bg-blue-500/20" />
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-blue-500/20 to-violet-500/20">
              <Icon className="h-4.5 w-4.5 text-blue-300" strokeWidth={1.75} />
            </span>
            <h3 className="mt-4 text-sm font-medium text-white">{title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeatureCardsSection;
