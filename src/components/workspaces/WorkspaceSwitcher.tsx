"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import type { ApiWorkspaceWithGroups } from "@/lib/api/types";
import { useRipple } from "@/components/ui/ripple";
import { CreateWorkspaceButton } from "./CreateWorkspaceButton";
import { CreateWorkspaceModal } from "./CreateWorkspaceModal";
import { useWorkspaceToolbar } from "./workspace-toolbar-context";
import { WorkspaceGatewayOverlay } from "./WorkspaceGatewayOverlay";

// Trang CHON workspace (danh sach the) - man chi tiet BEN TRONG 1 workspace
// da tach thanh trang rieng /workspace/[username]/[workspaceId] (xem
// WorkspaceDetail.tsx). Bam 1 the o day gio KHONG con chuyen "phase" noi bo
// nua ma choi 1 hieu ung chuyen canh sci-fi/JARVIS (WorkspaceGatewayOverlay,
// bê nguyên tu source rieng "workspace-gateway") roi dieu huong that sang
// trang chi tiet luc bam "Vào workspace".

// The workspace o man chon - tach thanh component rieng (thay vi inline
// trong .map()) vi useRipple() la 1 hook, khong the goi ben trong vong lap/
// callback. Hover nhe (nang len + vien ngat sang mau accent rieng cua
// workspace) + click nay ra hieu ung "giot nuoc" (useRipple) DUNG CHUNG voi
// CreateWorkspaceButton - 2 loai the trong cung luoi chon workspace nen phai
// cung 1 kieu tuong tac.
//
// Luc co workspace duoc chon (isTransitioning): cac the KHONG duoc chon rot
// xuong + mo dan (drop + fade, dung y nhu WorkspaceGatewayOverlay mo tren
// cung), the DUOC chon phong to nhe va GIU NGUYEN vi tri - cam giac "da o
// trung tam" den tu chinh overlay (hien ten/thong tin workspace phong to
// that su o giua man hinh), khong phai the nay tu bay toi do.
function WorkspaceCard({
  ws,
  index,
  isTransitioning,
  isSelected,
  onSelect,
}: {
  ws: ApiWorkspaceWithGroups;
  index: number;
  isTransitioning: boolean;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const accent = ws.color ?? "var(--primary)";
  const { onPointerDown, rippleLayer } = useRipple(accent);

  return (
    <motion.button
      type="button"
      // layoutId chia se voi WorkspaceGatewayOverlay.tsx - khi duoc chon,
      // Framer Motion tu FLIP-animate the nay "phong to" thanh overlay full
      // man hinh (khong con crossfade+scale-tai-cho nhu ban cu).
      layoutId={`workspace-card-${ws.id}`}
      onClick={onSelect}
      onPointerDown={onPointerDown}
      disabled={isTransitioning}
      initial={{ opacity: 0, y: 8 }}
      animate={
        isTransitioning && !isSelected
          ? { opacity: 0, y: 90, scale: 0.82, rotateX: 10 }
          : { opacity: 1, y: 0, scale: 1, rotateX: 0 }
      }
      transition={{
        delay: isTransitioning && !isSelected ? index * 0.035 : 0,
        duration: 0.52,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={
        isTransitioning
          ? undefined
          : {
              y: -3,
              boxShadow: `0 10px 30px color-mix(in srgb, ${accent} 18%, transparent)`,
              transition: { duration: 0.18, ease: "easeOut" },
            }
      }
      className="relative flex min-h-32 flex-col items-start gap-2 overflow-hidden rounded-2xl p-4 text-left backdrop-blur-sm"
      style={{
        // Vien gradient (khong phai border mau dac) - 2 lop background: lop
        // trong (padding-box) la nen kinh translucent nhu cu, lop ngoai
        // (border-box) la gradient tu trong suot (dinh) xuong accent (day)
        // chi hien o dung do rong border. border That phai "solid
        // transparent" thi background-clip: border-box moi ve duoc vao vung
        // do (border "co mau" 0 tu ban chat CSS, chi la ao giac tu 2 lop nen
        // chong nhau).
        border: "3px solid transparent",
        borderRadius: "inherit",
        backgroundImage: `linear-gradient(color-mix(in srgb, var(--surface) 88%, transparent), color-mix(in srgb, var(--surface) 88%, transparent)), linear-gradient(180deg, transparent 0%, color-mix(in srgb, ${accent} ${isSelected ? 90 : 70}%, transparent) 100%)`,
        backgroundOrigin: "border-box",
        backgroundClip: "padding-box, border-box",
      }}
    >
      {rippleLayer}
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-lg text-lg"
        style={{
          backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)`,
          color: accent,
        }}
      >
        {ws.icon ?? "📁"}
      </span>
      <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
        {ws.name}
      </span>
      {ws.description && (
        <span
          className="line-clamp-2 text-xs"
          style={{ color: "var(--ink-faint)" }}
        >
          {ws.description}
        </span>
      )}
      <span
        className="mt-auto text-[11px]"
        style={{ color: "var(--ink-faint)" }}
      >
        {ws.groups.length} nhóm kiến thức
      </span>
    </motion.button>
  );
}

export function WorkspaceSwitcher({
  workspaces,
  username,
  isSelf,
}: {
  workspaces: ApiWorkspaceWithGroups[];
  username: string;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<ApiWorkspaceWithGroups | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  // "Tao workspace" khong con la 1 nut rieng - dang ky lam 1 tool trong
  // ControlCenterReactor (o layout.tsx, boc NGOAI component nay) qua context,
  // vi la nguoi CHU trang (isSelf) moi thay tool nay. CreateWorkspaceModal
  // dung chung voi CreateWorkspaceButton (nut CTA khi man con rong).
  const { registerTool } = useWorkspaceToolbar();
  useEffect(() => {
    if (!isSelf) return;
    registerTool({
      id: "create-workspace",
      label: "Tạo workspace",
      icon: Plus,
      tone: "cyan",
      onClick: () => setCreateOpen(true),
    });
    return () => registerTool(null);
  }, [isSelf, registerTool]);

  const isTransitioning = selected !== null;

  return (
    // Khong con dat background/CosmicBackdrop rieng o day - nen "deep space"
    // (StarfieldBackground) gio nam o workspace/[username]/layout.tsx, phia
    // SAU component nay (z-0), nen de trong suot cho no hien qua.
    <div className="relative flex size-full flex-col overflow-hidden">
      {isSelf && (
        <CreateWorkspaceModal
          open={createOpen}
          onOpenChange={setCreateOpen}
          username={username}
        />
      )}

      <motion.div
        animate={{
          opacity: isTransitioning ? 0 : 1,
          y: isTransitioning ? -22 : 0,
          scale: isTransitioning ? 0.985 : 1,
        }}
        transition={{ duration: 0.42, ease: "easeOut" }}
        className="relative z-10 flex h-full flex-col items-center overflow-y-auto px-6 py-12"
      >
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
          <p className="mt-2 text-sm" style={{ color: "var(--ink-faint)" }}>
            Mỗi workspace là 1 vùng kiến thức riêng - chọn 1 cái để bước vào.
          </p>
        </div>

        {workspaces.length === 0 ? (
          isSelf ? (
            <div className="mb-auto w-full max-w-xs">
              <CreateWorkspaceButton username={username} />
            </div>
          ) : (
            <p
              className="mb-auto text-sm"
              style={{ color: "var(--ink-faint)" }}
            >
              Người dùng này chưa có workspace nào.
            </p>
          )
        ) : (
          <div className="mb-auto grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((ws, i) => (
              <WorkspaceCard
                key={ws.id}
                ws={ws}
                index={i}
                isTransitioning={isTransitioning}
                isSelected={selected?.id === ws.id}
                onSelect={() => setSelected(ws)}
              />
            ))}
          </div>
        )}
        <div className="mb-auto" />
      </motion.div>

      <WorkspaceGatewayOverlay
        workspace={selected}
        onEnter={(ws) => router.push(`/workspace/${username}/${ws.id}`)}
      />
    </div>
  );
}
