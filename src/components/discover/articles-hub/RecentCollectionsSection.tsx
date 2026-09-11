"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Globe2,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { useFollowToggle } from "./use-follow-toggle";
import type { PostCollectionApiShape } from "@/lib/api/collections";

export type CollectionsSectionPerson = {
  username: string;
  name: string;
  avatarUrl: string;
  verified: boolean;
  isSelf: boolean;
  isFollowing: boolean;
  collections: PostCollectionApiShape[];
};

type TabKey = "for-you" | "following";

type TabEntry =
  | { kind: "real"; key: TabKey; label: string; icon: typeof Sparkles }
  | { kind: "coming-soon"; label: string; icon: typeof Sparkles };

const TABS: TabEntry[] = [
  { kind: "real", key: "for-you", label: "Dành cho bạn", icon: Sparkles },
  { kind: "coming-soon", label: "Từ quản trị viên", icon: ShieldCheck },
  {
    kind: "real",
    key: "following",
    label: "Từ người bạn theo dõi",
    icon: Users,
  },
  { kind: "coming-soon", label: "Cộng đồng", icon: Globe2 },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
  },
};

// Khu "Bộ sưu tập gần đây" tren /home - CHI 2/4 tab co du lieu that de lam
// (Dành cho bạn/Từ người bạn theo dõi), 2 tab con lai (Quản trị viên/Cộng
// đồng) can khai niem "admin curated"/"cong dong" chua tung co trong app -
// de "Sắp có" trung thuc thay vi gia lap. `forYou`/`following` deu la
// Author kem collections + isFollowing THAT, fetch SAN o page.tsx (Server
// Component, xem home/page.tsx) - component nay chi doi tab hien thi mang
// nao, KHONG tu fetch them (tru nut Theo dõi tren tung the - goi API that
// luc bam, qua useFollowToggle dung chung).
export function RecentCollectionsSection({
  forYou,
  following,
  isLoggedIn,
}: {
  forYou: CollectionsSectionPerson[];
  following: CollectionsSectionPerson[];
  isLoggedIn: boolean;
}) {
  const [tab, setTab] = useState<TabKey>("for-you");
  const people = tab === "for-you" ? forYou : following;
  const carouselRef = useRef<HTMLDivElement>(null);

  function scrollCarousel(direction: "left" | "right") {
    carouselRef.current?.scrollBy({
      left: direction === "right" ? 420 : -420,
      behavior: "smooth",
    });
  }

  return (
    <section className="w-full">
      <div className="mt-6 rounded-2xl border border-slate-200/80 bg-[#f7f9fc]/60 px-4 py-4 sm:px-5 sm:py-5 lg:px-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-blue-500">
              <FolderOpen size={20} strokeWidth={1.8} />
            </div>
            <h2 className="font-content shrink-0 text-[18px] font-semibold tracking-tight text-slate-900 sm:text-[19px]">
              Bộ sưu tập gần đây
            </h2>
            <p className="font-content hidden truncate text-[12px] text-slate-400 xl:block">
              Khám phá những bộ sưu tập thú vị từ những người bạn theo dõi, quản
              trị viên và cộng đồng
            </p>
          </div>

          {isLoggedIn && (
            <Link
              href="/collections"
              className="group flex shrink-0 items-center gap-1 text-[12px] font-medium text-blue-600 transition-colors hover:text-blue-700"
            >
              <span>Xem tất cả</span>
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          )}
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
          {TABS.map((t) => {
            const Icon = t.icon;
            if (t.kind === "coming-soon") {
              return (
                <button
                  key={t.label}
                  type="button"
                  disabled
                  title="Sắp có"
                  className="flex h-8 shrink-0 cursor-not-allowed items-center gap-1.5 rounded-full border border-slate-200 bg-white/60 px-3 text-[12px] font-medium text-slate-300"
                >
                  <Icon size={13} strokeWidth={1.8} />
                  {t.label}
                </button>
              );
            }
            const active = t.key === tab;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12px] font-medium transition-all duration-200 ${
                  active
                    ? "bg-slate-900 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800"
                }`}
              >
                <Icon size={13} strokeWidth={1.8} />
                {t.label}
              </button>
            );
          })}
        </div>

        {tab === "following" && !isLoggedIn ? (
          <p className="font-content mt-4 py-4 text-[13px] text-slate-400">
            Đăng nhập để xem bộ sưu tập từ những người bạn theo dõi.
          </p>
        ) : people.length === 0 ? (
          <p className="font-content mt-4 py-4 text-[13px] text-slate-400">
            {tab === "for-you"
              ? "Chưa có bộ sưu tập nào để gợi ý."
              : "Những người bạn theo dõi chưa có bộ sưu tập nào."}
          </p>
        ) : (
          <div className="relative mt-3">
            <motion.div
              ref={carouselRef}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-0.5 scrollbar-none"
            >
              {people.map((person) => (
                <PersonCollectionsCard key={person.username} person={person} />
              ))}
            </motion.div>

            <button
              type="button"
              onClick={() => scrollCarousel("left")}
              aria-label="Trước"
              className="absolute -left-4 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-[0_3px_12px_rgba(15,23,42,.08)] transition hover:text-slate-900 lg:flex"
            >
              <ChevronLeft size={17} />
            </button>
            <button
              type="button"
              onClick={() => scrollCarousel("right")}
              aria-label="Sau"
              className="absolute -right-4 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-[0_3px_12px_rgba(15,23,42,.08)] transition hover:text-slate-900 lg:flex"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function PersonCollectionsCard({
  person,
}: {
  person: CollectionsSectionPerson;
}) {
  const { following, pending, toggle } = useFollowToggle(
    person.username,
    person.isFollowing,
  );

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -2 }}
      className={`group w-65 shrink-0 snap-start overflow-hidden rounded-[11px] border bg-white transition-shadow duration-300 ${
        person.isSelf
          ? "border-blue-300 shadow-[0_0_0_1px_rgba(59,130,246,.06)]"
          : "border-slate-200 hover:shadow-[0_8px_24px_rgba(15,23,42,.06)]"
      }`}
    >
      <div className="flex items-center justify-between px-3.5 pt-3.5">
        <Link
          href={`/u/${person.username}`}
          className="flex min-w-0 items-center gap-2.5"
        >
          <Image
            src={person.avatarUrl}
            alt={person.name}
            width={36}
            height={36}
            className="size-9 shrink-0 rounded-full object-cover"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-content max-w-31.25 truncate text-[12.5px] font-semibold text-slate-900">
                {person.name}
              </span>
              {person.verified && (
                <span className="flex size-3.5 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white">
                  <Check size={8} strokeWidth={3} />
                </span>
              )}
            </div>
            <p className="font-content mt-0.5 text-[10.5px] text-slate-400">
              {person.collections.length} bộ sưu tập
            </p>
          </div>
        </Link>

        {person.isSelf ? (
          <span className="shrink-0 whitespace-nowrap rounded-full bg-blue-50 px-2 py-1 text-[9.5px] font-medium text-blue-600">
            Hồ sơ của tôi
          </span>
        ) : (
          <button
            type="button"
            onClick={toggle}
            disabled={pending}
            className={`shrink-0 rounded-[7px] border px-2.5 py-1.5 text-[10px] font-medium transition-all disabled:cursor-default disabled:opacity-70 ${
              following
                ? "border-slate-200 bg-white text-slate-500"
                : "border-transparent bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            {following ? "Đang theo dõi" : "Theo dõi"}
          </button>
        )}
      </div>

      <div className="mt-3 px-3.5">
        <div className="space-y-2">
          {person.collections.slice(0, 2).map((c) => (
            <Link
              key={c.id}
              href={`/collections/${c.id}`}
              className="flex w-full items-center gap-2.5 rounded-lg text-left transition-transform duration-150 ease-out hover:translate-x-0.5"
            >
              <div className="relative size-9.5 shrink-0 overflow-hidden rounded-[7px] bg-slate-100">
                {c.coverImageUrl ? (
                  <Image
                    src={c.coverImageUrl}
                    alt=""
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-slate-400">
                    <FolderOpen size={16} strokeWidth={1.6} />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-content truncate text-[12px] font-medium text-slate-800">
                  {c.title}
                </p>
                <p className="font-content mt-0.5 text-[10px] text-slate-400">
                  {c.postCount} bài viết
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mx-3.5 mt-3 border-t border-slate-100" />

      <Link
        href={`/u/${person.username}/collections`}
        className="group/link flex w-full items-center gap-1 px-3.5 py-2.5 text-left text-[11px] font-medium text-blue-600 transition-colors hover:text-blue-700"
      >
        Xem tất cả {person.collections.length} bộ sưu tập
        <ArrowRight
          size={12}
          className="transition-transform group-hover/link:translate-x-0.5"
        />
      </Link>
    </motion.div>
  );
}
