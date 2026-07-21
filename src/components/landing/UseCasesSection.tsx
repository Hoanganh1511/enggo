import { useCases } from "@/content/landing";

const UseCasesSection = () => {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="text-center text-2xl font-semibold text-ink sm:text-3xl">
        Không chỉ dành cho dân kỹ thuật
      </h2>
      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {useCases.map((u) => (
          <div
            key={u.title}
            className="rounded-xl border border-border bg-surface p-6"
          >
            <h3 className="text-base font-medium text-ink">{u.title}</h3>
            <p className="mt-2 text-sm text-ink-muted">{u.description}</p>
            <p className="mt-4 rounded-md bg-surface-muted px-3 py-2 text-xs text-ink-faint">
              {u.example}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default UseCasesSection;
