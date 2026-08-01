import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

// Content-width THUC (chua tinh padding) cho tung muc rong co dinh - giu
// nguyen gia tri cu cua max-w-4xl/5xl/6xl/7xl (rem quy doi px: 56/64/72/80rem).
// max-width thuc te se rong hon so nay 2*var(--layout-padding) (bien dinh
// nghia o globals.css, tang dan theo breakpoint) - nho vay padding co the doi
// theo man hinh ma vung noi dung nhin thay VAN GIU DUNG so px nay, khong bi
// hut vao vi padding an them.
const MAX_WIDTH_CLASS = {
  "4xl": "max-w-[calc(896px+2*var(--layout-padding))]",
  "5xl": "max-w-[calc(1024px+2*var(--layout-padding))]",
  "6xl": "max-w-[calc(1152px+2*var(--layout-padding))]",
  "7xl": "max-w-[calc(1280px+2*var(--layout-padding))]",
} as const;

// Khong truyen maxWidth -> content-width tang dan theo breakpoint (giong
// container chuan Tailwind: 640/768/1024/1280/1536), cung cong them
// 2*var(--layout-padding) nhu tren o moi muc.
const DEFAULT_MAX_WIDTH_CLASS =
  "w-full sm:max-w-[calc(640px+2*var(--layout-padding))] md:max-w-[calc(768px+2*var(--layout-padding))] lg:max-w-[calc(1024px+2*var(--layout-padding))] xl:max-w-[calc(1980px+2*var(--layout-padding))] 2xl:max-w-[calc(1536px+2*var(--layout-padding))]";

type SectionContainerProps = {
  as?: ElementType;
  id?: string;
  maxWidth?: keyof typeof MAX_WIDTH_CLASS;
  className?: string;
  children: ReactNode;
};

// Container dung chung cho moi trang (landing + app): mx-auto + max-w-* +
// padding ngang, ca hai deu dua tren --layout-padding thay vi px-6 co dinh.
// py-*/px-* rieng va cac class khac (grid, flex...) truyen qua className de
// override - cn() dung tailwind-merge nen class sau se thang class mac dinh.
const SectionContainer = ({
  as: Tag = "section",
  id,
  maxWidth,
  className,
  children,
}: SectionContainerProps) => {
  const widthClass = maxWidth
    ? MAX_WIDTH_CLASS[maxWidth]
    : DEFAULT_MAX_WIDTH_CLASS;

  return (
    <Tag
      id={id}
      className={cn(
        "mx-auto px-[var(--layout-padding)]",
        widthClass,
        className,
      )}
    >
      {children}
    </Tag>
  );
};

export default SectionContainer;
