import type { Metadata } from "next";
import { Roboto, Geist_Mono, Noto_Serif } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toast";
import { AuthSessionProvider } from "@/components/providers/session-provider";

// Font chinh toan app - xem globals.css --font-sans. Cac font rieng
// (Be Vietnam Pro cho PostCard, Work Sans cho breadcrumb Workspace, Patrick
// Hand cho Profile/Sidebar) da BO theo yeu cau nguoi dung - toan app gio
// dung dung 1 font Inter, khong con ngoai le.
const inter = Roboto({
  variable: "--font-inter",
  weight: "400",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Rieng cho khu vuc "hanh trinh cuon sach" (JourneyHero/ChapterCard/
// WelcomeOnboardingModal...) - truoc dung raw "Georgia, serif" (khong qua
// next/font) nhung Georgia thieu glyph ghep san cho dau thanh tieng Viet
// (vd "đầu" bi tach dau ra khoi chu, hien loi nhu "đâ`u"). Noto Serif co
// subset "vietnamese" rieng (thiet ke du Unicode cho dau to hop), dung qua
// next/font (tu host, khong goi Google luc runtime) de sua tan goc - KHONG
// dung cho phan con lai cua app (van chi Inter, dung tinh than "khong con
// ngoai le" o comment tren, day la ngoai le DUY NHAT + co chu dich, theo
// yeu cau nguoi dung ve tone "cuon sach").
const notoSerifBook = Noto_Serif({
  variable: "--font-serif-book",
  weight: ["400", "500", "600", "700"],
  subsets: ["vietnamese", "latin"],
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
      className={`${inter.variable} ${geistMono.variable} ${notoSerifBook.variable} h-full antialiased`}
    >
      <body className="relative flex h-dvh flex-col overflow-hidden">
        {/* <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(125%_125%_at_50%_10%,_#fff_40%,_#475569_100%)]" /> */}
        <AuthSessionProvider>{children}</AuthSessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
