"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Pencil, Plus, Users } from "lucide-react";
import type { ApiSuggestedWorkspace, ApiWorkspaceWithGroups } from "@/lib/api/types";
import { useRipple } from "@/components/ui/ripple";
import { CreateWorkspaceButton } from "./CreateWorkspaceButton";
import { CreateWorkspaceModal } from "./CreateWorkspaceModal";
import { EditWorkspaceModal } from "./EditWorkspaceModal";
import { useWorkspaceToolbar } from "./workspace-toolbar-context";

// Mau "concept" cua khu vuc Workspace (xem docs/workspace-style-guide.md muc
// 8) - dung cho avatar fallback/icon mac dinh trong strip goi y, KHONG dung
// var(--primary) (mau teal cu khac concept).
const CONCEPT_BLUE = "#269ce9";

// Chu trong hero/card o day nam TREN anh nen bau troi co dinh (workspace-bg.png,
// xem layout.tsx) - anh KHONG doi theo theme sang/toi nen chu cung phai mau
// CO DINH de luon doc duoc, khong dung token --ink thich ung theme.
const HERO_INK = "#0f172a";
const HERO_INK_MUTED = "#475569";
const HERO_INK_FAINT = "#64748b";

function OwnerAvatar({
  name,
  avatarUrl,
  size,
}: {
  name: string;
  avatarUrl: string | null;
  size: number;
}) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt=""
        referrerPolicy="no-referrer"
        style={{ width: size, height: size }}
        className="shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.42, background: CONCEPT_BLUE }}
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}

// Trang CHON workspace (danh sach the) - man chi tiet BEN TRONG 1 workspace
// da tach thanh trang rieng /workspace/[username]/[workspaceId]. Bam 1 the
// o day dieu huong THANG (Link) sang trang chi tiet - khong con hieu ung
// chuyen canh "cong" sci-fi (WorkspaceGatewayOverlay, da xoa) nua, doi theo
// tong sang moi cua trang (xem layout.tsx).
function WorkspaceCard({
  ws,
  username,
  isSelf,
  ownerName,
  ownerAvatarUrl,
}: {
  ws: ApiWorkspaceWithGroups;
  username: string;
  isSelf: boolean;
  ownerName: string;
  ownerAvatarUrl: string | null;
}) {
  const accent = ws.color ?? "var(--primary)";
  const { onPointerDown, rippleLayer } = useRipple(accent);
  const [editOpen, setEditOpen] = useState(false);

  return (
    <Link
      href={`/workspace/${username}/${ws.id}`}
      onPointerDown={onPointerDown}
      className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl p-4 backdrop-blur-sm transition-transform duration-150 ease-out hover:-translate-y-0.5"
      style={{
        background: "color-mix(in srgb, white 92%, transparent)",
        border: "1px solid color-mix(in srgb, white 60%, transparent)",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
      }}
    >
      {rippleLayer}
      {/* Sua thong tin co ban - CHI chu workspace (isSelf). Nam trong Link
          (dieu huong ca the) nen phai preventDefault+stopPropagation de
          khong bi dieu huong nham khi bam nut nay. */}
      {isSelf && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setEditOpen(true);
          }}
          title="Sửa workspace"
          aria-label="Sửa workspace"
          className="absolute top-3 right-3 z-10 flex size-7 cursor-pointer items-center justify-center rounded-full opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100"
          style={{
            background: "color-mix(in srgb, white 85%, transparent)",
            color: HERO_INK_FAINT,
          }}
        >
          <Pencil size={12} strokeWidth={2} />
        </button>
      )}
      {isSelf && (
        <EditWorkspaceModal
          workspace={ws}
          username={username}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}

      <div className="flex items-start gap-3">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-xl text-lg"
          style={{
            backgroundColor: `color-mix(in srgb, ${accent} 14%, transparent)`,
            color: accent,
          }}
        >
          {ws.icon ?? "📁"}
        </span>
        <div className="min-w-0 flex-1">
          <span className="block text-sm font-semibold" style={{ color: HERO_INK }}>
            {ws.name}
          </span>
          <span className="block text-[11px]" style={{ color: HERO_INK_FAINT }}>
            {ws.groups.length} nhóm kiến thức
          </span>
        </div>
      </div>

      {ws.description && (
        <span className="line-clamp-2 text-xs" style={{ color: HERO_INK_MUTED }}>
          {ws.description}
        </span>
      )}

      <div
        className="mt-auto flex items-center justify-between gap-2 border-t pt-3"
        style={{ borderColor: "color-mix(in srgb, #0f172a 8%, transparent)" }}
      >
        <div className="flex min-w-0 items-center gap-1.5">
          <OwnerAvatar name={ownerName} avatarUrl={ownerAvatarUrl} size={18} />
          <span className="truncate text-[11px]" style={{ color: HERO_INK_FAINT }}>
            Chủ sở hữu <strong style={{ color: HERO_INK_MUTED }}>{ownerName}</strong>
          </span>
        </div>
        <span
          className="flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors duration-150 ease-out group-hover:opacity-90"
          style={{
            background: `color-mix(in srgb, ${accent} 14%, transparent)`,
            color: accent,
          }}
        >
          Vào workspace
          <ArrowRight size={11} strokeWidth={2.4} />
        </span>
      </div>
    </Link>
  );
}

// The "+ Tao workspace moi" - luon hien trong luoi khi isSelf (kha nang
// truoc day chi hien luc man rong/chua co workspace nao), cung 1 hanh dong
// voi tool "create-workspace" tren WorkspaceQuickToolbar (chi la 1 loi vao
// khac, khong trung logic - ca 2 deu mo CreateWorkspaceModal qua state cuc
// bo o component cha).
function CreateWorkspaceCard({ onClick }: { onClick: () => void }) {
  const { onPointerDown, rippleLayer } = useRipple("var(--primary)");
  return (
    <motion.button
      type="button"
      onClick={onClick}
      onPointerDown={onPointerDown}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="relative flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl text-sm font-medium"
      style={{
        border: "2px dashed color-mix(in srgb, #0f172a 18%, transparent)",
        color: HERO_INK_FAINT,
        background: "color-mix(in srgb, white 55%, transparent)",
      }}
    >
      {rippleLayer}
      <Plus size={20} strokeWidth={2} />
      Tạo workspace mới
    </motion.button>
  );
}

// The goi y (workspace cua nguoi khac, tu strip "Gợi ý từ người bạn theo
// dõi") - danh so thu tu theo vi tri trong mang (rank), giu nguyen y nghia
// "goi y theo nguoi dang follow" (KHONG doi thanh "trending" vi khong co du
// lieu tang truong that o backend).
function SuggestedWorkspaceCard({ ws, rank }: { ws: ApiSuggestedWorkspace; rank: number }) {
  const accent = ws.color ?? CONCEPT_BLUE;
  return (
    <Link
      href={`/workspace/${ws.owner.username}/${ws.id}`}
      className="relative flex w-[220px] shrink-0 flex-col gap-2.5 rounded-2xl p-3.5 transition-transform duration-150 ease-out hover:-translate-y-0.5"
      style={{
        background: "color-mix(in srgb, white 92%, transparent)",
        border: "1px solid color-mix(in srgb, white 60%, transparent)",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
      }}
    >
      <span
        className="flex size-6 items-center justify-center rounded-full text-[11px] font-bold text-white"
        style={{ background: CONCEPT_BLUE }}
      >
        {rank}
      </span>
      <div className="flex items-center gap-2">
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-base"
          style={{ background: `color-mix(in srgb, ${accent} 14%, transparent)`, color: accent }}
        >
          {ws.icon ?? "📁"}
        </span>
        <span className="min-w-0 flex-1 truncate text-[13px] font-semibold" style={{ color: HERO_INK }}>
          {ws.name}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <OwnerAvatar name={ws.owner.name} avatarUrl={ws.owner.avatarUrl} size={16} />
        <span className="truncate text-[11px]" style={{ color: HERO_INK_FAINT }}>
          {ws.owner.name}
        </span>
      </div>
      <span className="text-[11px]" style={{ color: HERO_INK_FAINT }}>
        {ws.groupCount} nhóm kiến thức
      </span>
    </Link>
  );
}

export function WorkspaceSwitcher({
  workspaces,
  username,
  isSelf,
  ownerName,
  ownerAvatarUrl,
  suggested,
}: {
  workspaces: ApiWorkspaceWithGroups[];
  username: string;
  isSelf: boolean;
  ownerName: string;
  ownerAvatarUrl: string | null;
  suggested: ApiSuggestedWorkspace[];
}) {
  const [createOpen, setCreateOpen] = useState(false);
  // "Tao workspace" dang ky lam 1 tool tren WorkspaceQuickToolbar (o
  // layout.tsx, boc NGOAI component nay) qua context, vi la nguoi CHU trang
  // (isSelf) moi thay tool nay. CreateWorkspaceModal dung chung voi
  // CreateWorkspaceCard/CreateWorkspaceButton.
  const { registerTool } = useWorkspaceToolbar();
  useEffect(() => {
    if (!isSelf) return;
    registerTool({
      id: "create-workspace",
      label: "Tạo workspace",
      icon: Plus,
      onClick: () => setCreateOpen(true),
    });
    return () => registerTool(null);
  }, [isSelf, registerTool]);

  return (
    // Khong con dat background rieng o day - anh nen bau troi/dao noi nam o
    // workspace/[username]/layout.tsx, phia SAU component nay (z-0).
    <div className="relative flex size-full flex-col overflow-hidden">
      {isSelf && (
        <CreateWorkspaceModal
          open={createOpen}
          onOpenChange={setCreateOpen}
          username={username}
        />
      )}

      <div className="relative z-10 flex h-full flex-col items-center overflow-y-auto px-6 py-12">
        <div className="mb-9 mt-auto text-center">
          <h1 className="flex items-center justify-center">
            {/* Hieu ung "bubble" luc logo xuat hien - phong to qua trang thai
                roi lang dan ve dung kich thuoc (spring damping thap = co
                overshoot/bat lai that su, khong phai tuong tuong), CHI CHAY
                1 LAN luc mount (khong lap vo han - dung nguyen tac style
                guide: khong glow/pulse trang tri thuan tuy). */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 12 }}
            >
              <Image
                src="/assets/images/workspaces/workspace-logo-removebg-preview.png"
                alt="Workspace"
                width={360}
                height={240}
                className="h-24 w-auto sm:h-32"
                priority
              />
            </motion.div>
          </h1>

          {/* Chu so huu RO RANG - truoc day man nay chi co logo + tagline
              chung chung, dung o trang cua ai cung giong het nhau, khong the
              phan biet "workspace cua minh" hay "cua nguoi khac". */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <OwnerAvatar name={ownerName} avatarUrl={ownerAvatarUrl} size={26} />
            <span className="text-[13px]" style={{ color: HERO_INK_MUTED }}>
              {isSelf ? (
                <>
                  Workspace của <strong style={{ color: HERO_INK }}>bạn</strong>
                </>
              ) : (
                <>
                  Workspace của{" "}
                  <strong style={{ color: HERO_INK }}>{ownerName}</strong>{" "}
                  <span style={{ color: HERO_INK_FAINT }}>@{username}</span>
                </>
              )}
            </span>
          </div>

          <p className="mt-2 text-sm" style={{ color: HERO_INK_FAINT }}>
            Mỗi workspace là 1 vùng kiến thức riêng - chọn 1 cái để bước vào.
          </p>
        </div>

        {workspaces.length === 0 && !isSelf ? (
          <p className="mb-auto text-sm" style={{ color: HERO_INK_FAINT }}>
            Người dùng này chưa có workspace nào.
          </p>
        ) : (
          <div className="grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((ws) => (
              <WorkspaceCard
                key={ws.id}
                ws={ws}
                username={username}
                isSelf={isSelf}
                ownerName={ownerName}
                ownerAvatarUrl={ownerAvatarUrl}
              />
            ))}
            {isSelf &&
              (workspaces.length === 0 ? (
                <CreateWorkspaceButton username={username} />
              ) : (
                <CreateWorkspaceCard onClick={() => setCreateOpen(true)} />
              ))}
          </div>
        )}

        {/* Goi y workspace tu nguoi dang follow - CHI hien tren trang cua
            CHINH MINH (isSelf), vi day la goi y RIENG cho viewer, dua vao
            trang cua nguoi khac se lac de/khong lien quan gi den boi canh
            dang xem. */}
        {isSelf && suggested.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.35 }}
            className="mb-auto w-full max-w-5xl"
          >
            <div className="mt-10 mb-3 flex items-center gap-1.5">
              <Users size={13} strokeWidth={2} style={{ color: HERO_INK_FAINT }} />
              <h2 className="text-[12px] font-bold tracking-wide" style={{ color: HERO_INK_FAINT }}>
                GỢI Ý TỪ NGƯỜI BẠN THEO DÕI
              </h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {suggested.map((ws, i) => (
                <SuggestedWorkspaceCard key={ws.id} ws={ws} rank={i + 1} />
              ))}
            </div>
          </motion.div>
        )}

        <div className="mb-auto" />
      </div>
    </div>
  );
}
