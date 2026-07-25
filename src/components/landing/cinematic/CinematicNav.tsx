import { LogoIcon } from "@/components/ui/logo";
import { nav, hero } from "@/content/landing";
import LoginModal from "../LoginModal";

const CinematicNav = () => {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#05070d]/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="#" className="flex items-center gap-2.5">
          <LogoIcon size={26} />
          <span className="text-base font-semibold tracking-tight text-white">
            CareerTree
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {nav.links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-slate-400 transition-colors duration-150 ease-out hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#"
            className="hidden text-sm text-slate-400 transition-colors duration-150 ease-out hover:text-white sm:inline"
          >
            Đăng nhập
          </a>
          <LoginModal
            triggerLabel={hero.ctaPrimaryLabel}
            triggerClassName="cursor-pointer rounded-full bg-linear-to-r from-blue-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-transform duration-150 ease-out hover:scale-105"
          />
        </div>
      </div>
    </header>
  );
};

export default CinematicNav;
