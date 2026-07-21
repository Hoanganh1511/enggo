import Logo from "@/components/ui/logo";
import GoogleIcon from "@/components/ui/google-icon";
import { signInAction } from "@/actions/auth/sign-in-action";

const LoginCard = () => {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-surface-muted">
        <Logo orientation="icon-only" size={28} />
      </span>
      <h2 className="mt-3 text-xl font-semibold text-ink">Career Tree</h2>
      <p className="text-sm text-ink-muted">Đăng nhập để tiếp tục</p>

      <form action={signInAction} className="mt-6 w-full">
        <button
          type="submit"
          className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium text-ink transition-colors duration-150 ease-out hover:bg-hover-bg"
        >
          <GoogleIcon className="h-4 w-4 shrink-0" />
          Đăng nhập với Google
        </button>
      </form>

      <div className="mt-8 flex w-full flex-col items-center gap-2 border-t border-border pt-6">
        <p className="text-xs font-medium text-ink-muted">
          Một tài khoản duy nhất cho Career Tree
        </p>
        <p className="text-xs text-ink-faint">
          Kiến thức của bạn. Con đường của bạn. Tất cả trong một nơi.
        </p>
        <div className="mt-2 flex items-center gap-2 text-xs">
          <a href="#" className="text-primary hover:underline">
            Chính sách bảo mật
          </a>
          <span className="text-ink-faint">|</span>
          <a href="#" className="text-primary hover:underline">
            Điều khoản dịch vụ
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginCard;
