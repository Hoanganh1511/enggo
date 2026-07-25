import { LogoIcon } from "@/components/ui/logo";
import { footer } from "@/content/landing";

const CinematicFooter = () => {
  return (
    <footer className="border-t border-white/10 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2">
          <LogoIcon size={20} />
          <span className="text-xs font-medium text-slate-400">
            CareerTree
          </span>
        </div>
        <nav className="flex items-center gap-5">
          {footer.links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs text-slate-500 transition-colors duration-150 ease-out hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
};

export default CinematicFooter;
