import { ctaFinal } from "@/content/landing";
import LoginModal from "./LoginModal";

const CtaSection = () => {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20 text-center">
      <h2 className="text-2xl font-semibold text-ink sm:text-3xl">
        {ctaFinal.headline}
      </h2>
      <div className="mt-6 flex justify-center">
        <LoginModal
          triggerLabel={ctaFinal.ctaLabel}
          triggerClassName="cursor-pointer rounded-md bg-primary px-6 py-3 text-sm font-medium text-white transition-colors duration-150 ease-out hover:bg-primary-hover"
        />
      </div>
    </section>
  );
};

export default CtaSection;
