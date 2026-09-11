"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  FolderOpen,
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
  { kind: "real", key: "following", label: "Từ người bạn theo dõi", icon: Users },
  { kind: "coming-soon", label: "Cộng đồng", icon: FolderOpen },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
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

  return (
    <section className="w-full">
      <div className="mt-6 overflow-hidden rounded-[16px] border border-slate-200/80 bg-[#f7f9fc] px-4 py-5 sm:px-5 lg:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <FolderOpen size={20} strokeWidth={1.8} className="text-blue-500" />
              <h2 className="font-mono text-[18px] font-semibold tracking-[-0.02em] text-slate-900 sm:text-[20px]">
                Bộ sưu tập gần đây
              </h2>
              <span className="hidden text-[13px] text-slate-400 lg:block">
                Khám phá những bộ sưu tập thú vị từ những người bạn theo dõi,
                quản trị viên và cộng đồng
              </span>
            </div>
          </div>

          {isLoggedIn && (
            <Link
              href="/collections"
              className="group flex shrink-0 items-center gap-1.5 text-[13px] font-medium text-blue-600 transition hover:text-blue-700"
            >
              Xem tất cả
              <ArrowRight
                size={15}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>
          )}
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {TABS.map((t) => {
            const Icon = t.icon;
            if (t.kind === "coming-soon") {
              return (
                <button
                  key={t.label}
                  type="button"
                  disabled
                  title="Sắp có"
                  className="flex h-[34px] shrink-0 cursor-not-allowed items-center gap-1.5 rounded-full border border-slate-200 bg-white/60 px-3.5 text-[13px] font-medium text-slate-300"
                >
                  <Icon size={14} strokeWidth={1.8} />
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
                className={`flex h-[34px] shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium transition-all ${
                  active
                    ? "bg-slate-900 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800"
                }`}
              >
                <Icon size={14} strokeWidth={1.8} />
                {t.label}
              </button>
            );
          })}
        </div>

        {tab === "following" && !isLoggedIn ? (
          <p className="mt-4 py-4 text-[13px] text-slate-400">
            Đăng nhập để xem bộ sưu tập từ những người bạn theo dõi.
          </p>
        ) : people.length === 0 ? (
          <p className="mt-4 py-4 text-[13px] text-slate-400">
            {tab === "for-you"
              ? "Chưa có bộ sưu tập nào để gợi ý."
              : "Những người bạn theo dõi chưa có bộ sưu tập nào."}
          </p>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-4 flex gap-3.5 overflow-x-auto pb-2 scrollbar-none"
          >
            {people.map((person) => (
              <PersonCollectionsCard key={person.username} person={person} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}

function PersonCollectionsCard({ person }: { person: CollectionsSectionPerson }) {
  const { following, pending, toggle } = useFollowToggle(person.username, person.isFollowing);

  return (
    <motion.article
      variants={cardVariants}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={`group relative w-70 shrink-0 overflow-hidden rounded-[12px] border bg-white transition-shadow duration-300 ${
        person.isSelf
          ? "border-blue-300 shadow-[0_0_0_1px_rgba(59,130,246,0.08)]"
          : "border-slate-200/90 hover:shadow-[0_8px_30px_rgba(15,23,42,0.07)]"
      }`}
    >
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between gap-2">
          <Link href={`/u/${person.username}`} className="flex min-w-0 items-center gap-2.5">
            <Image
              src={person.avatarUrl}
              alt={person.name}
              width={36}
              height={36}
              className="size-9 shrink-0 rounded-full object-cover ring-2 ring-white"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="truncate text-[13px] font-semibold text-slate-900">
                  {person.name}
                </span>
                {person.verified && (
                  <span className="flex size-3.5 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white">
                    <Check size={9} strokeWidth={3} />
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400">
                {person.collections.length} bộ sưu tập
              </span>
            </div>
          </Link>

          {person.isSelf && (
            <span className="shrink-0 rounded-full bg-blue-50 px-2 py-1 text-[10px] font-medium text-blue-600">
              Hồ sơ của tôi
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 px-4">
        <div className="space-y-2">
          {person.collections.slice(0, 3).map((c) => (
            <Link
              key={c.id}
              href={`/collections/${c.id}`}
              className="flex w-full items-center gap-2.5 rounded-lg text-left transition-transform duration-150 ease-out hover:translate-x-0.5"
            >
              <div className="relative size-[38px] shrink-0 overflow-hidden rounded-[7px] bg-slate-100">
                {c.coverImageUrl ? (
                  <Image src={c.coverImageUrl} alt="" fill className="object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center text-slate-400">
                    <FolderOpen size={16} strokeWidth={1.6} />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12.5px] font-medium text-slate-800">
                  {c.title}
                </div>
                <div className="mt-0.5 text-[10.5px] text-slate-400">
                  {c.postCount} bài viết
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mx-4 mt-3 border-t border-slate-100" />

      <div className="flex items-center justify-between px-4 py-3">
        <Link
          href={`/u/${person.username}/collections`}
          className="group/link flex items-center gap-1 text-[12px] font-medium text-blue-600 transition hover:text-blue-700"
        >
          Xem tất cả {person.collections.length} bộ sưu tập
          <ArrowRight size={13} className="transition-transform group-hover/link:translate-x-0.5" />
        </Link>

        {!person.isSelf && (
          <button
            type="button"
            onClick={toggle}
            disabled={pending}
            className={`rounded-[7px] px-3 py-1.5 text-[11px] font-medium transition-all disabled:cursor-default disabled:opacity-70 ${
              following
                ? "border border-slate-200 bg-white text-slate-500"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            {following ? "Đang theo dõi" : "Theo dõi"}
          </button>
        )}
      </div>
    </motion.article>
  );
}
