import { faqs } from "@/content/landing";

const FaqSection = () => {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <h2 className="text-center text-2xl font-semibold text-ink sm:text-3xl">
        Câu hỏi thường gặp
      </h2>
      <div className="mt-10 flex flex-col gap-3">
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className="group rounded-xl border border-border bg-surface px-5 py-4"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-ink marker:content-none">
              {faq.question}
              <span className="shrink-0 text-lg leading-none text-ink-faint transition-transform duration-150 ease-out group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm text-ink-muted">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
};

export default FaqSection;
