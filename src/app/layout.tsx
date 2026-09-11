import type { Metadata } from "next";
import {
  IBM_Plex_Mono,
  Manrope,
  Geist_Mono,
  Noto_Serif,
  Playfair_Display,
} from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toast";
import { AuthSessionProvider } from "@/components/providers/session-provider";

// Font chinh toan app - xem globals.css --font-sans. Doi tu Inter sang IBM
// Plex Mono theo yeu cau nguoi dung (ap dung cho MOI text thuong cua app,
// khong chi code/label) - co san subset "vietnamese" rieng (khac Playfair/DM
// Sans ben duoi), nen dau tieng Viet van hien dung ma khong can fallback
// latin-ext.
const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["400", "500", "600", "700"],
  subsets: ["vietnamese", "latin"],
});

// Font cho NOI DUNG (khac component/dieu huong) - tieu de bai/tai lieu, than
// bai, mo ta, binh luan, cac thong tin hien thi... noi chung MOI cho khong
// phai nut/nhan/tab/sidebar dieu huong deu dung Manrope thay vi
// --font-plex-mono (font chinh, chi danh cho UI/dieu huong). Ap qua class
// tien ich .font-content (xem globals.css --font-content) tren tung cum text
// noi dung, KHONG doi --font-sans mac dinh (se keo theo ca UI).
const manrope = Manrope({
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["vietnamese", "latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
// chi IBM Plex Mono), chi ap dung tung cho tieu de/noi dung dai o 2 khu vuc
// nay qua var(--font-serif-book) truc tiep (chua co Tailwind utility rieng).
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
  // (khac Noto Serif/DM Sans o tren) - dung "latin-ext" (Latin Extended,
  // bao gom phan lon to hop dau tieng Viet) de van co glyph day du cho cum
  // "cả cuộc đời" thay vi rong subset.
  subsets: ["latin", "latin-ext"],
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
      className={`${ibmPlexMono.variable} ${manrope.variable} ${geistMono.variable} ${notoSerifBook.variable} ${playfairDisplay.variable} h-full antialiased`}
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
        <AuthSessionProvider>{children}</AuthSessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
