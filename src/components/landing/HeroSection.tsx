import { hero } from "@/content/landing";
import TreeDemo from "./TreeDemo";
import LoginModal from "./LoginModal";

const HeroSection = () => {
  return (
    <section className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 pt-20 pb-16 text-center">
      <div className="flex flex-col items-center gap-5">
        <h1 className="max-w-3xl text-3xl font-semibold text-ink sm:text-4xl md:text-5xl">
          {hero.headline}
        </h1>
        <p className="max-w-xl text-base text-ink-muted sm:text-lg">
          {hero.subheadline}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <LoginModal
            triggerLabel={hero.ctaPrimaryLabel}
            triggerClassName="cursor-pointer rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 ease-out hover:bg-primary-hover"
          />
          <a
            href={hero.ctaSecondary.href}
            className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-ink transition-colors duration-150 ease-out hover:bg-hover-bg"
          >
            {hero.ctaSecondary.label}
          </a>
        </div>
      </div>

      <div className="w-full rounded-2xl border border-border bg-surface-muted p-6 sm:p-10">
        <TreeDemo highlight={["career", "backend"]} />
      </div>
    </section>
  );
};

export default HeroSection;
