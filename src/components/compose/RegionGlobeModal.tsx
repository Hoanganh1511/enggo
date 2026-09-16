"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { GlobeMethods } from "react-globe.gl";

// react-globe.gl dung Canvas/WebGL thuan (khong qua @react-three/fiber du app
// da co san fiber+drei o CommunityCampus3D.tsx) - yeu cau nguoi dung neu dung
// THANG ten thu vien nay ("dùng thư viện gì... react-globe.gl"). Bat buoc
// dynamic ssr:false NGAY TRONG file client nay (giong CommunityCampus3DLoader.tsx)
// vi WebGL/`document` khong ton tai phia server.
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

export type RegionGlobeTarget = { label: string; lat: number; lng: number };

// Modal "quay quả địa cầu 3D tới đúng vị trí" - yeu cau nguoi dung: "tôi có
// một list các region aws trên thế giới, tôi muốn khi click vào chúng sẽ
// hiện modal có quả địa cầu 3d rồi quay tới, xong focus vào đúng vị trí đó".
// Dung Radix Dialog THUAN (khong qua SimpleModal.tsx) vi SimpleModal ep
// title/padding/scroll co dinh, khong hop voi 1 khung canvas WebGL vuong lon
// can toan quyen kich thuoc - o day tu ve overlay/animation rieng bang
// framer-motion (scale+fade, cung tinh than animation dropdown chuan cua app
// nhung phong to cho phu hop 1 modal lon).
export function RegionGlobeModal({
  target,
  onOpenChange,
}: {
  target: RegionGlobeTarget | null;
  onOpenChange: (open: boolean) => void;
}) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 320, height: 320 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect;
      if (box) setSize({ width: Math.round(box.width), height: Math.round(box.height) });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <Dialog.Root open={target !== null} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {target && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="fixed inset-0 z-50 bg-overlay"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount onOpenAutoFocus={(e) => e.preventDefault()}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="fixed top-1/2 left-1/2 z-50 flex w-[calc(100%-3rem)] max-w-125 -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-xl focus:outline-none"
              >
                <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border p-4">
                  <div className="min-w-0">
                    <Dialog.Title className="text-[13px] font-bold text-ink">
                      {target.label || "Vị trí"}
                    </Dialog.Title>
                    <Dialog.Description className="mt-0.5 font-mono text-[11px] text-ink-faint">
                      {target.lat.toFixed(4)}, {target.lng.toFixed(4)}
                    </Dialog.Description>
                  </div>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      aria-label="Đóng"
                      className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink-faint hover:bg-hover-bg hover:text-ink"
                    >
                      <X size={16} strokeWidth={2} />
                    </button>
                  </Dialog.Close>
                </div>
                <div ref={containerRef} className="aspect-square w-full bg-[#000814]">
                  <Globe
                    ref={globeRef}
                    width={size.width}
                    height={size.height}
                    backgroundColor="rgba(0,0,0,0)"
                    globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                    bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                    showAtmosphere
                    atmosphereColor="#7dd3fc"
                    pointsData={[target]}
                    pointLat="lat"
                    pointLng="lng"
                    pointColor={() => "#f97316"}
                    pointAltitude={0.02}
                    pointRadius={0.6}
                    labelsData={[target]}
                    labelLat="lat"
                    labelLng="lng"
                    labelText="label"
                    labelSize={1.1}
                    labelDotRadius={0.4}
                    labelColor={() => "#f97316"}
                    // Bat dau tu 1 goc toan canh (altitude cao), roi "quay tới"
                    // dung vi tri muc tieu ngay khi globe san sang - dung
                    // onGlobeReady (KHONG phai setTimeout doan mo) de chac
                    // chan instance da khoi tao xong truoc khi goi pointOfView.
                    onGlobeReady={() => {
                      globeRef.current?.pointOfView({ lat: target.lat, lng: target.lng, altitude: 2.2 }, 0);
                      globeRef.current?.pointOfView(
                        { lat: target.lat, lng: target.lng, altitude: 1.4 },
                        1800,
                      );
                    }}
                  />
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
