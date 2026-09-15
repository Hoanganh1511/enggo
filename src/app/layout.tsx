import type { Metadata } from "next";
import {
  Be_Vietnam_Pro,
  Geist,
  Geist_Mono,
  Noto_Serif,
  Playfair_Display,
  Inter,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "@/components/ui/toast";
import { AuthSessionProvider } from "@/components/providers/session-provider";

// Font cho NOI DUNG (khac component/dieu huong) - tieu de bai/tai lieu, than
// bai, mo ta, binh luan, cac thong tin hien thi... noi chung MOI cho khong
// phai nut/nhan/tab/sidebar dieu huong deu dung Be Vietnam Pro thay vi
// --font-sans (font chinh, chi danh cho UI/dieu huong). Ap qua class
// tien ich .font-content (xem globals.css --font-content) tren tung cum text
// noi dung, KHONG doi --font-sans mac dinh (se keo theo ca UI).
//
// Da doi qua 2 lan: Manrope -> DM Sans -> Be Vietnam Pro. DM Sans BI LOI
// tieng Viet - next/font/google chi cho subset "latin"/"latin-ext" voi font
// nay (KHONG co "vietnamese"), va "latin-ext" (Latin Extended-A, danh cho
// tieng Trung/Dong Au) KHONG bao gom khoi Latin Extended Additional
// (U+1EA0-1EF9) ma tieng Viet dung cho cac nguyen am co dau to hop (ệ/ị/ẵ/ộ/
// ử...) - nhung ky tu do bi fallback sang font khac, chu nhin lech/khong
// dong bo voi phan con lai. Be Vietnam Pro co subset "vietnamese" THAT (thiet
// ke rieng cho tieng Viet), kieu dang geometric-humanist gan giong DM Sans
// (tron, hien dai, de doc) nen giu duoc tinh than yeu cau ban dau ma khong
// con loi.
const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["vietnamese", "latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Rieng cho TYPE SYSTEM cua sidebar Series (SeriesSidebar.tsx + ten Series o
// layout.tsx) - yeu cau nguoi dung (bang cau hinh chi tiet Series
// title/Section/Navigation/Entry...) chot Geist Sans cho toan bo cac muc do,
// KHAC voi Inter (--font-inter) dang dung cho phan con lai cua .series-scope
// (than bai/tieu de trang...) - CHI ap dung o CAC PHAN TU sidebar cu the qua
// var(--font-geist-sans) truc tiep, KHONG doi --font-content/font mac dinh
// ca scope.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Ban dau rieng cho khu vuc "hanh trinh cuon sach" (JourneyHero/ChapterCard/
// WelcomeOnboardingModal...) - truoc dung raw "Georgia, serif" (khong qua
// next/font) nhung Georgia thieu glyph ghep san cho dau thanh tieng Viet
// (vd "đầu" bi tach dau ra khoi chu, hien loi nhu "đâ`u"). Noto Serif co
// subset "vietnamese" rieng (thiet ke du Unicode cho dau to hop), dung qua
// next/font (tu host, khong goi Google luc runtime) de sua tan goc. Sau do
// mo rong them cho tieu de trang chi tiet bai viet (ArticleHeader.tsx, theo
// yeu cau nguoi dung) - VAN khong dung cho UI/dieu huong chung cua app (van
// chi --font-sans mac dinh), chi ap dung tung cho tieu de/noi dung dai o 2
// khu vuc nay qua var(--font-serif-book) truc tiep (chua co Tailwind utility
// rieng).
const notoSerifBook = Noto_Serif({
  variable: "--font-serif-book",
  weight: ["400", "500", "600", "700"],
  subsets: ["vietnamese", "latin"],
});

// Rieng cho trang chi tiet GL Life Book (services/life-book/page.tsx, cum
// "từng trang một") - font nhan manh mang tinh chat "tap chi/hoai niem"
// rieng cua trang do, KHONG lien quan --font-sans/--font-content chung.
const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  weight: ["600"],
  style: ["italic"],
  // Playfair Display KHONG co subset "vietnamese" rieng tren Google Fonts
  // (khac Noto Serif/Be Vietnam Pro o tren) - dung "latin-ext" (Latin Extended,
  // bao gom phan lon to hop dau tieng Viet) de van co glyph day du cho cum
  // "cả cuộc đời" thay vi rong subset.
  subsets: ["latin", "latin-ext"],
});

// [2026-09-15] Doi lai lam --font-sans (font chinh) toan app - yeu cau nguoi
// dung: "Đổi font chính lại thành Inter đi" (dao nguoc quyet dinh truoc day
// doi --font-sans sang IBM Plex Mono, da bo IBM_Plex_Mono khoi file nay).
// Van GIU rieng cho khu vuc Series qua .series-scope (globals.css) - THIET
// KE RIENG cho module do (Heading/Body/Nav deu Inter, chi khac WEIGHT qua
// class font-bold/font-medium...) gio TRUNG voi font mac dinh toan app,
// nhung khai bao rieng khong thua vi 2 he thong (Series/toan app) van co the
// tach lai doc lap trong tuong lai.
const inter = Inter({
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["vietnamese", "latin"],
});

// Code trong khu vuc Series (command cai dat, source badge...) - JetBrains
// Mono theo thiet ke, thay the --font-mono mac dinh (Geist Mono) CHI trong
// pham vi .series-scope.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Career Tree",
  description: "Created by Tuấn Anh",
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${beVietnamPro.variable} ${geistMono.variable} ${geistSans.variable} ${notoSerifBook.variable} ${playfairDisplay.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      {/* suppressHydrationWarning CHI o body, KHONG lan xuong children - can
          thiet vi mot so extension trinh duyet (vd ColorZilla) tu chen
          attribute la (cz-shortcut-listen="true"...) vao <body> TRUOC khi
          React hydrate, khien React tuong server/client HTML lech nhau du
          code khong sai gi - day la workaround chinh thuc cua Next.js cho
          truong hop nay (xem nextjs.org/docs/messages/react-hydration-error). */}
      <body
        className="relative flex h-dvh flex-col overflow-hidden"
        suppressHydrationWarning
      >
        {/* <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(125%_125%_at_50%_10%,_#fff_40%,_#475569_100%)]" /> */}
        {/* Thanh loading dieu huong trang - dung dung "#18181b" (--primary
            global, den) thay vi mau xanh mac dinh cua thu vien, khop tinh
            than "trang den don gian" da chot cho toan app (xem globals.css
            :root comment) - KHONG them mau accent moi. Tat spinner goc phai
            + shadow phat sang (glow den tren nen trang ra vet xam mo, khong
            hop voi phong cach toi gian) - chi giu 1 vach mong 3px o dinh. */}
        <NextTopLoader color="#18181b" showSpinner={false} shadow={false} />
        <AuthSessionProvider>{children}</AuthSessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
