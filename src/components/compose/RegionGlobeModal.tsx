"use client";

import { useEffect, useRef, useState } from "react";
import { Portal } from "@radix-ui/react-portal";
import dynamic from "next/dynamic";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GlobeMethods } from "react-globe.gl";

// react-globe.gl dung Canvas/WebGL thuan (khong qua @react-three/fiber du app
// da co san fiber+drei o CommunityCampus3D.tsx) - yeu cau nguoi dung neu dung
// THANG ten thu vien nay ("dùng thư viện gì... react-globe.gl"). Bat buoc
// dynamic ssr:false NGAY TRONG file client nay (giong CommunityCampus3DLoader.tsx)
// vi WebGL/`document` khong ton tai phia server.
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

export type RegionGlobeTarget = { label: string; lat: number; lng: number };

// [2026-09-16 REWRITE] Ban dau dung Radix Dialog + AnimatePresence UNMOUNT
// het cay (ke ca <Globe>) moi lan dong modal - day chinh la nguyen nhan bug
// nguoi dung bao "tắt đi bật những cái khác thì đen ngòm, không lên gì nữa":
// react-globe.gl/three.js KHONG dam bao dispose sach WebGL context luc
// unmount, tao/huy lien tuc rat de "chet" context o lan mo thu 2. Fix DUNG
// CACH cho thu vien nay: Globe MOUNT DUY NHAT 1 LAN (lan dau tien nguoi dung
// bam mo, xem `everOpened`) roi O LAI TRONG DOM MAI MAI - dong/mo sau do CHI
// doi CSS opacity/pointer-events (KHONG unmount), giong dung khuyen nghi cua
// chinh thu vien (API pauseAnimation/resumeAnimation ton tai chinh la cho
// tinh huong nay) - moi lan doi vi tri chi goi lai pointOfView() tren CUNG 1
// instance qua 1 effect rieng (khong con dung onGlobeReady moi lan mo, vi
// callback do gio chi ban DUNG 1 LAN trong ca doi component). Portal thang
// vao document.body (khong qua Radix Dialog nua) de tu kiem soat viec KHONG
// unmount - Escape/click-nen-den de dong thay cho Radix.
export function RegionGlobeModal({
  target,
  onOpenChange,
}: {
  target: RegionGlobeTarget | null;
  onOpenChange: (open: boolean) => void;
}) {
  const open = target !== null;
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 400, height: 400 });
  const [ready, setReady] = useState(false);
  // "Adjusting state during rendering" (mau chinh thuc cua React, KHONG phai
  // effect) - tranh loi lint react-hooks/set-state-in-effect (cam goi setState
  // dong bo trong useEffect). Goi setState THANG trong than component khi
  // phat hien `open` vua doi tu props (so sanh voi `prevOpen` luu lai) la
  // cach hop le de "nho lai da tung mo" ma khong can effect rieng.
  const [prevOpen, setPrevOpen] = useState(open);
  const [everOpened, setEverOpened] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setEverOpened(true);
  }

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  // Container CHI xuat hien tu lan `everOpened` dau tien, nhung TU DO KHONG
  // BAO GIO bi go khoi DOM nua (xem comment dau file) - ResizeObserver gan 1
  // LAN DUY NHAT la du, khong can gan lai theo `target`/`open` nhu ban cu.
  useEffect(() => {
    if (!everOpened) return;
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect;
      if (box && box.width > 0 && box.height > 0) {
        setSize({ width: Math.round(box.width), height: Math.round(box.height) });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [everOpened]);

  // "Quay tới, xong focus vào đúng vị trí" - chay LAI moi lan `target` doi
  // (ke ca lan mo thu 2/3... voi 1 region khac), KHONG con phu thuoc
  // onGlobeReady (chi ban 1 lan). Bat dau tu goc nhin toan canh (altitude
  // cao, transition=0 - nhay ngay khong hoat hinh) roi moi "bay" toi gan
  // (1800ms) - dung setTimeout ngan de dam bao lenh dau da ap dung xong
  // truoc khi bat lenh bay toi (2 lenh pointOfView goi lien tiep cung
  // frame de bi lenh sau "de bep" lenh truoc).
  useEffect(() => {
    if (!target || !ready) return;
    globeRef.current?.pointOfView({ lat: target.lat, lng: target.lng, altitude: 2.4 }, 0);
    const t = setTimeout(() => {
      globeRef.current?.pointOfView({ lat: target.lat, lng: target.lng, altitude: 1.5 }, 1800);
    }, 60);
    return () => clearTimeout(t);
  }, [target, ready]);

  return (
    <Portal>
      <div
        aria-hidden="true"
        onClick={() => onOpenChange(false)}
        className={cn(
          "fixed inset-0 z-50 bg-overlay transition-opacity duration-200 ease-out",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      {everOpened && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={target?.label || "Vị trí trên bản đồ"}
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center px-6 transition-[opacity,transform] duration-200 ease-out",
            open ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0",
          )}
        >
          <div className="flex w-full max-w-125 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-xl">
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border p-4">
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-ink">{target?.label || "Vị trí"}</p>
                <p className="mt-0.5 font-mono text-[11px] text-ink-faint">
                  {target ? `${target.lat.toFixed(4)}, ${target.lng.toFixed(4)}` : ""}
                </p>
              </div>
              <button
                type="button"
                aria-label="Đóng"
                onClick={() => onOpenChange(false)}
                className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink-faint hover:bg-hover-bg hover:text-ink"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>
            <div ref={containerRef} className="aspect-square w-full bg-[#000410]">
              <Globe
                ref={globeRef}
                width={size.width}
                height={size.height}
                backgroundColor="rgba(0,0,0,0)"
                backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                showAtmosphere
                atmosphereColor="#60a5fa"
                atmosphereAltitude={0.22}
                pointsData={target ? [target] : []}
                pointLat="lat"
                pointLng="lng"
                pointColor={() => "#f97316"}
                pointAltitude={0.015}
                pointRadius={0.45}
                labelsData={target ? [target] : []}
                labelLat="lat"
                labelLng="lng"
                labelText="label"
                labelSize={1.15}
                labelDotRadius={0.35}
                labelColor={() => "#fdba74"}
                labelAltitude={0.016}
                onGlobeReady={() => setReady(true)}
              />
            </div>
          </div>
        </div>
      )}
    </Portal>
  );
}
