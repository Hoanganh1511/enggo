import { features } from "@/content/landing";

const FeaturesSection = () => {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="text-center text-2xl font-semibold text-ink sm:text-3xl">
        Vì sao chọn Career Tree
      </h2>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="rounded-xl border border-border bg-surface p-5"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-muted">
              <Icon
                className="h-4.5 w-4.5 text-icon-active"
                strokeWidth={1.75}
              />
            </span>
            <h3 className="mt-3 text-sm font-medium text-ink">{title}</h3>
            <p className="mt-1.5 text-xs text-ink-muted">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
