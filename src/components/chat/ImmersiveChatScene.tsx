"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Bone,
  Car,
  Cat,
  Cloud,
  Dog,
  Dumbbell,
  Footprints,
  Heart,
  Mountain,
  PawPrint,
  Route,
  Sparkles,
  Sun,
  Trees,
  Waves,
} from "lucide-react";
import type { ImmersiveThemeId } from "./chat-immersive-themes";

// Khung canh nen DONG cho tung theme - port tu source "immersive-chat-bubbles-react"
// nguoi dung tai ve (main.jsx), rut gon: bo prop `active` (source goc chi
// bat SparkleField luc hover ca khung preview - man /messages that khong co
// 1 diem hover "toan khung" tu nhien tuong duong, nen cho sparkle chay LIEN
// TUC nhe nhang thay vi gan them 1 trang thai hover moi). Dat lam lop nen
// TUYET DOI (absolute inset-0, pointer-events-none) phia SAU header/khung
// cuon tin nhan/composer trong <main> cua MessagesShell.tsx - khong phai o
// TRONG khung cuon (se troi theo scroll, sai y dinh "khung canh co dinh").
function SparkleField({ color }: { color: string }) {
  return (
    <>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0, 0.8, 0], scale: [0.7, 1.2, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.35 }}
          className="absolute"
          style={{ left: `${12 + i * 14}%`, top: `${16 + (i % 3) * 24}%`, color }}
        >
          <Sparkles size={10 + (i % 3) * 4} />
        </motion.div>
      ))}
    </>
  );
}

function CloudScene() {
  return (
    <>
      <motion.div
        animate={{ x: ["-12%", "105%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        className="absolute top-[12%] left-0 opacity-50"
      >
        <Cloud size={90} strokeWidth={1.2} color="#8CC8FF" />
      </motion.div>
      <motion.div
        animate={{ x: ["105%", "-20%"] }}
        transition={{ duration: 35, repeat: Infinity, ease: "linear", delay: 6 }}
        className="absolute top-[30%] right-0 opacity-35"
      >
        <Cloud size={140} strokeWidth={1} color="#A9D8FF" />
      </motion.div>
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[2%] left-[8%] opacity-35"
      >
        <Cloud size={180} strokeWidth={1} color="#8CC8FF" />
      </motion.div>
      <SparkleField color="#6EB6FF" />
    </>
  );
}

function GymScene() {
  return (
    <>
      <motion.div
        animate={{ rotate: [-5, 5, -5], y: [0, -5, 0] }}
        transition={{ duration: 1.8, repeat: Infinity }}
        className="absolute bottom-[8%] right-[6%] opacity-35"
      >
        <Dumbbell size={170} strokeWidth={1} color="#A55AF5" />
      </motion.div>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ x: [0, 50], opacity: [0, 0.65, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.35 }}
          className="absolute h-px rounded-full"
          style={{
            top: `${25 + i * 13}%`,
            left: "42%",
            width: `${80 + i * 30}px`,
            background: "#B66CFF",
          }}
        />
      ))}
      <SparkleField color="#9B45F4" />
    </>
  );
}

function CatScene() {
  return (
    <>
      <motion.div
        animate={{ x: [-40, 30, -40], rotate: [-3, 3, -3] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[5%] right-[7%] opacity-30"
      >
        <Cat size={180} strokeWidth={1} color="#F28A1A" />
      </motion.div>
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0, 0.8, 0], y: [0, -35], x: [0, 25] }}
          transition={{ duration: 2.3, repeat: Infinity, delay: i * 0.45 }}
          className="absolute text-orange-300"
          style={{ right: `${14 + i * 8}%`, bottom: `${20 + (i % 2) * 15}%` }}
        >
          <Footprints size={22 + i * 2} />
        </motion.div>
      ))}
      <motion.div
        animate={{ rotate: [-1, 1, -1] }}
        transition={{ duration: 1.2, repeat: Infinity }}
        className="absolute bottom-[18%] left-[7%] text-orange-300 opacity-25"
      >
        <Cat size={130} strokeWidth={1} />
      </motion.div>
    </>
  );
}

function DogScene() {
  return (
    <>
      <motion.div
        animate={{ x: [-80, 100], y: [8, -5, 8] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[7%] left-[48%] opacity-25"
      >
        <Dog size={170} strokeWidth={1} color="#43C96B" />
      </motion.div>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0, 1, 0], x: [0, 45], y: [0, -20] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.28 }}
          className="absolute text-green-400"
          style={{ left: `${18 + i * 10}%`, bottom: `${17 + (i % 2) * 8}%` }}
        >
          <Footprints size={18} />
        </motion.div>
      ))}
      <motion.div
        animate={{ rotate: [-8, 8, -8] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="absolute right-[8%] bottom-[12%] text-green-400 opacity-40"
      >
        <Bone size={50} />
      </motion.div>
    </>
  );
}

function PinkyScene() {
  const hearts = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: 4 + ((i * 17) % 90),
        delay: (i % 7) * 0.55,
        size: 10 + (i % 4) * 5,
      })),
    [],
  );
  return (
    <>
      {hearts.map((h) => (
        <motion.div
          key={h.id}
          animate={{
            y: [35, -130],
            opacity: [0, 0.7, 0],
            x: [0, h.id % 2 ? 18 : -18, 0],
          }}
          transition={{
            duration: 5 + (h.id % 3),
            repeat: Infinity,
            delay: h.delay,
            ease: "easeInOut",
          }}
          className="absolute text-pink-300"
          style={{ left: `${h.left}%`, bottom: "-5%" }}
        >
          <Heart size={h.size} fill="currentColor" />
        </motion.div>
      ))}
      <SparkleField color="#F553A0" />
    </>
  );
}

function PandaScene() {
  return (
    <>
      <motion.div
        animate={{ y: [5, -5, 5], rotate: [-1, 1, -1] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute bottom-[0%] right-[7%] opacity-30"
      >
        <Trees size={190} strokeWidth={1} color="#6E987A" />
      </motion.div>
      <motion.div
        animate={{ x: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute bottom-[4%] right-[22%] opacity-20"
      >
        <PawPrint size={130} strokeWidth={1} color="#64748B" />
      </motion.div>
      <SparkleField color="#78927F" />
    </>
  );
}

function CarScene() {
  return (
    <>
      <div className="absolute bottom-[15%] inset-x-0 h-px bg-red-200/60" />
      <div className="absolute bottom-[10%] inset-x-0 h-px bg-red-100/50" />
      <motion.div
        animate={{ x: ["-20%", "120%"] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[17%] opacity-35"
      >
        <Car size={120} strokeWidth={1} color="#F33A42" />
      </motion.div>
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          animate={{ x: [0, 90], opacity: [0, 0.6, 0] }}
          transition={{ duration: 1.3, repeat: Infinity, delay: i * 0.3 }}
          className="absolute h-[3px] rounded-full bg-red-300"
          style={{ width: 60 + i * 18, bottom: `${20 + i * 6}%`, left: "5%" }}
        />
      ))}
      <Route className="absolute right-[8%] bottom-[7%] text-red-300 opacity-35" size={120} />
    </>
  );
}

function MountainScene() {
  return (
    <>
      <motion.div
        animate={{ x: [-10, 10, -10] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-2%] left-[42%] opacity-25"
      >
        <Mountain size={260} strokeWidth={0.8} color="#4285F4" />
      </motion.div>
      <motion.div
        animate={{ x: [80, -120] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        className="absolute top-[18%] left-0 opacity-20"
      >
        <Cloud size={150} strokeWidth={1} color="#7FB3FF" />
      </motion.div>
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute bottom-[3%] right-[12%] text-blue-500 opacity-20"
      >
        <Mountain size={150} strokeWidth={1} />
      </motion.div>
      <SparkleField color="#4285F4" />
    </>
  );
}

function BeachScene() {
  return (
    <>
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [-2, 2, -2] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute right-[8%] top-[8%] text-amber-300 opacity-35"
      >
        <Sun size={110} strokeWidth={1} />
      </motion.div>
      <motion.div
        animate={{ x: ["-10%", "10%", "-10%"] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[5%] left-0 text-amber-400 opacity-30"
      >
        <Waves size={400} strokeWidth={1} />
      </motion.div>
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3.5, repeat: Infinity }}
        className="absolute bottom-[6%] left-[8%] text-amber-500 opacity-20"
      >
        <Sun size={120} strokeWidth={1} />
      </motion.div>
      <SparkleField color="#F4A900" />
    </>
  );
}

export function ImmersiveChatScene({ themeId }: { themeId: ImmersiveThemeId }) {
  if (themeId === "none") return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {themeId === "cloud" && <CloudScene />}
      {themeId === "gym" && <GymScene />}
      {themeId === "cat" && <CatScene />}
      {themeId === "dog" && <DogScene />}
      {themeId === "pinky" && <PinkyScene />}
      {themeId === "panda" && <PandaScene />}
      {themeId === "car" && <CarScene />}
      {themeId === "mountain" && <MountainScene />}
      {themeId === "beach" && <BeachScene />}
    </div>
  );
}
