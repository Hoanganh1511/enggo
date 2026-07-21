import { problems } from "@/content/landing";

const ProblemSection = () => {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h2 className="text-center text-2xl font-semibold text-ink sm:text-3xl">
        Bạn có đang gặp phải...
      </h2>
      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {problems.map((p) => (
          <div
            key={p.title}
            className="rounded-xl border border-border bg-surface p-6"
          >
            <h3 className="text-base font-medium text-ink">{p.title}</h3>
            <p className="mt-2 text-sm text-ink-muted">{p.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProblemSection;
