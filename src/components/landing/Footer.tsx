import Logo from "@/components/ui/logo";
import { footer } from "@/content/landing";

const Footer = () => {
  return (
    <footer className="border-t border-border px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2">
          <Logo orientation="icon-only" size={20} />
          <span className="text-xs font-medium text-ink-muted">
            Career Tree
          </span>
        </div>
        <nav className="flex items-center gap-5">
          {footer.links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs text-ink-muted transition-colors duration-150 ease-out hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
