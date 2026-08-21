import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toast";
import { AuthSessionProvider } from "@/components/providers/session-provider";

// Font chinh toan app - xem globals.css --font-sans. Cac font rieng
// (Be Vietnam Pro cho PostCard, Work Sans cho breadcrumb Workspace, Patrick
// Hand cho Profile/Sidebar) da BO theo yeu cau nguoi dung - toan app gio
// dung dung 1 font Inter, khong con ngoai le.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex h-dvh flex-col overflow-hidden ">
        <AuthSessionProvider>{children}</AuthSessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
