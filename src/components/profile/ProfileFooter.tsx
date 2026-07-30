import Link from "next/link";

const LINKS = [
  { label: "Giới thiệu", href: "/about" },
  { label: "Điều khoản", href: "/terms" },
  { label: "Chính sách", href: "/privacy" },
  { label: "Liên hệ", href: "/contact" },
  { label: "RSS", href: "/rss.xml" },
];

// Chan trang rieng cua profile - tran vien giong header/nav de khoi noi dung
// profile duoc dong khung tron ven tu tren xuong duoi.
const ProfileFooter = ({ displayName }: { displayName: string }) => {
  return (
    <div className=" -mb-4 border-t border-border bg-surface py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-ink-muted transition-colors duration-150 ease-out hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-ink-faint">
            © {new Date().getFullYear()} {displayName}. All rights reserved.
          </p>
        </div>

        <span className="text-xs text-ink-muted">Tiếng Việt</span>
      </div>
    </div>
  );
};

export default ProfileFooter;
