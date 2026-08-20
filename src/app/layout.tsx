import type { Metadata } from "next";
import {
  Inter,
  Geist_Mono,
  Be_Vietnam_Pro,
  Work_Sans,
  Patrick_Hand,
} from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toast";
import { AuthSessionProvider } from "@/components/providers/session-provider";

// Font chinh toan app - xem globals.css --font-sans.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Font rieng cho PostCard (xem globals.css --font-card / class "font-card")
// - thiet ke danh rieng cho tieng Viet (subset "vietnamese"), net tron/than
// thien gan giong anh mau nguoi dung gui, KHONG doi font toan app.
const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
});

// Font rieng cho breadcrumb khu vuc Workspace (xem globals.css --font-breadcrumb
// / class "font-breadcrumb") - Amazon Ember la font doc quyen, khong the nhung
// truc tiep; Work Sans la lua chon MIEN PHI gan giong nhat (cung nhom humanist
// sans, x-height/be rong chu tuong tu) duoc dung pho bien lam font thay the.
const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

// Font vien tay/nhan manh rieng cho trang Profile ("font-hand" trong
// globals.css) - port tu source treecareer-profile-universe-v2, dung cho ten
// hien thi/tieu de dang "note ca nhan" trong sidebar profile va cac khoi
// Universe/Journey. KHONG co bo Vietnamese cho Patrick Hand (Google Fonts
// khong cung cap), text tieng Viet co dau se tu fallback ve Be Vietnam Pro
// qua khai bao font-family list trong .font-hand.
const patrickHand = Patrick_Hand({
  variable: "--font-patrick-hand",
  subsets: ["latin"],
  weight: "400",
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
      className={`${inter.variable} ${geistMono.variable} ${beVietnamPro.variable} ${workSans.variable} ${patrickHand.variable} h-full antialiased`}
    >
      <body className="flex h-dvh flex-col overflow-hidden ">
        <AuthSessionProvider>{children}</AuthSessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
