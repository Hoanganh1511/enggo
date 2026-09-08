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
    return NextResponse.redirect(new URL("/home", req.nextUrl));
  }
});

// Truoc day chi loai tru ".png$" - anh next/image local (vd
// public/assets/images/**) duoc optimizer FETCH LAI qua chinh app (khong doc
// thang tu filesystem), request do lai di qua proxy nay. File .jpg/.jpeg/...
// khong khop ".png$" nen bi redirect ve /login (tra ve HTML) thay vi bytes
// anh that -> optimizer bao loi "not a valid image", anh khong hien (bug da
// gap voi feature-ai/work/life.jpg). Loai tru CA CUM duoi anh/font/media pho
// bien thay vi chi rieng .png, tranh lap lai bug nay voi dinh dang khac sau
// nay.
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|.*\\.(?:png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|otf|mp4|webm)$).*)",
  ],
};
