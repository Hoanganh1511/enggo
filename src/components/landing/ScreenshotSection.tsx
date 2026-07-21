import Image from "next/image";
import { screenshots } from "@/content/landing";

const ScreenshotSection = () => {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="text-center text-2xl font-semibold text-ink sm:text-3xl">
        Giao diện thật
      </h2>
      <div className="mt-10 flex flex-col gap-6">
        {screenshots.map((s) => (
          <div
            key={s.src}
            className="mx-auto w-full max-w-4xl overflow-hidden rounded-xl border border-border bg-surface-muted"
          >
            <Image
              src={s.src}
              alt={s.alt}
              width={s.width}
              height={s.height}
              className="h-auto w-full object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ScreenshotSection;
