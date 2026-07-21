import { NextResponse } from "next/server";
import { auth } from "@/auth";

// "/" la landing page marketing, public hoan toan - khong yeu cau dang nhap.
const PUBLIC_PATHS = ["/", "/login"];

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const pathname = req.nextUrl.pathname;
  const isPublicPath = PUBLIC_PATHS.includes(pathname);
  const isLoginPage = pathname.startsWith("/login");

  if (!isLoggedIn && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/topics", req.nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
