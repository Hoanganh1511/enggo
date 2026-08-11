"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Float,
  Instance,
  Instances,
  OrbitControls,
  Text,
} from "@react-three/drei";
import * as THREE from "three";
import type { ApiCommunitySummary } from "@/lib/api/types";
import { formatCompact } from "@/lib/format-number";

// Adapt tu "treecareer-knowledge-building-interior" (prototype r3f rieng) -
// CHI lay man "Campus" (toa nha 3D dai dien 1 don vi kien thuc), bo cac buoc
// sau (Building/Floor/Room/Knowledge graph) vi do la hanh trinh hoc CA NHAN
// trong 1 workspace, khong co du lieu tuong duong o Community (khong bia
// "tang"/"phong"/"node kien thuc" gia).

const ACCENTS = [
  "#3b82f6",
  "#22c55e",
  "#a855f7",
  "#ec4899",
  "#f59e0b",
  "#14b8a6",
];

function accentOf(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i)) % 997;
  return ACCENTS[h % ACCENTS.length];
}

// Chieu cao toa nha suy tu SO THANH VIEN THAT (log-scale) - cong dong dong
// hon thi cao hon, nhung clamp lai de 1 cong dong qua lon khong lam toa nha
// cao vo ly so voi phan con lai.
function heightOf(memberCount: number): number {
  const raw = 2.4 + Math.log2(memberCount + 1) * 0.55;
  return Math.min(6, Math.max(2.4, raw));
}

type Building = {
  id: string;
  slug: string;
  name: string;
  memberCount: number;
  channelCount: number;
  color: string;
  pos: [number, number, number];
  h: number;
};

// Sap xep toa nha thanh luoi vuong CAN GIUA goc (0,0,0) - khong hardcode vi
// tri nhu ban goc (chi co dung 7 workspace co dinh san), vi so community that
// co the it hon hoac nhieu hon nhieu. Cac hang le duoc SO LE nua o spacing
// (nhu xep gach) thay vi thang hang tuyet doi voi hang chan - neu khong, khi
// nhin campus tu goc 3/4 (xem CommunityCampus3D camera), toa nha hang sau se
// bi toa nha hang truoc cung cot che khuat hoan toan.
function layoutBuildings(communities: ApiCommunitySummary[]): Building[] {
  const cols = Math.max(1, Math.ceil(Math.sqrt(communities.length)));
  const spacing = 6.4;
  const offset = (cols - 1) / 2;
  return communities.map((c, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const stagger = row % 2 === 1 ? spacing / 2 : 0;
    return {
      id: c.id,
      slug: c.slug,
      name: c.name,
      memberCount: c.memberCount,
      channelCount: c.channelCount,
      color: accentOf(c.name),
      pos: [(col - offset) * spacing + stagger, 0, (row - offset) * spacing],
      h: heightOf(c.memberCount),
    };
  });
}

// Curtain wall THAT: 1 mat facade = luoi nhieu panel kinh nho + mullion
// (khung nhom) rieng, thay vi 1 mat phang kinh duy nhat - roughness kinh phai
// THAP (0.08-0.1), roughness cao se nhin nhu nhua chu khong phai kinh. Dung
// chung cho ca mat truoc (offset huong +z) va mat ben (offset huong +x, xoay
// 90 do quanh Y) qua 2 tham so offset/rotation.
function GlassFace({
  width,
  height,
  offset,
  rotation,
  color,
  glow,
}: {
  width: number;
  height: number;
  offset: [number, number, number];
  rotation: [number, number, number];
  color: string;
  glow: boolean;
}) {
  const colGap = 0.5;
  const rowGap = 0.55;
  const startY = 0.85; // bat dau cao hon podium de khong chong panel
  const columns = Math.max(2, Math.floor(width / colGap));
  const rows = Math.max(2, Math.floor((height - startY) / rowGap));
  const gridHeight = rows * rowGap;
  const paneW = colGap - 0.1;
  const paneH = rowGap - 0.1;

  return (
    <group position={offset} rotation={rotation}>
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const x = -width / 2 + colGap / 2 + col * colGap;
          const y = startY + rowGap / 2 + row * rowGap;
          return (
            <mesh key={`${row}-${col}`} position={[x, y, 0]}>
              <planeGeometry args={[paneW, paneH]} />
              <meshPhysicalMaterial
                color={glow ? color : "#cfe3f5"}
                metalness={0.4}
                roughness={0.1}
                transmission={0.2}
                thickness={0.2}
                ior={1.45}
                transparent
                opacity={glow ? 0.88 : 0.6}
                emissive={glow ? color : "#000000"}
                emissiveIntensity={glow ? 1.1 : 0}
              />
            </mesh>
          );
        }),
      )}
      {Array.from({ length: columns + 1 }).map((_, i) => (
        <mesh
          key={`v-${i}`}
          position={[-width / 2 + i * colGap, startY + gridHeight / 2, 0.012]}
        >
          <boxGeometry args={[0.025, gridHeight, 0.03]} />
          <meshStandardMaterial color="#9c93b8" metalness={0.7} roughness={0.25} />
        </mesh>
      ))}
      {Array.from({ length: rows + 1 }).map((_, i) => (
        <mesh key={`h-${i}`} position={[0, startY + i * rowGap, 0.016]}>
          <boxGeometry args={[width, 0.025, 0.03]} />
          <meshStandardMaterial color="#9c93b8" metalness={0.7} roughness={0.25} />
        </mesh>
      ))}
    </group>
  );
}

// Tang de (podium) - rong hon than thap tang, kem 1 dai kinh "sanh vao"
// phat sang - dac trung cua kien truc toa nha van phong hien dai.
function Podium({
  width,
  depth,
  accent,
  glow,
}: {
  width: number;
  depth: number;
  accent: string;
  glow: boolean;
}) {
  return (
    <group>
      <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
        <boxGeometry args={[width * 1.16, 0.56, depth * 1.16]} />
        <meshPhysicalMaterial
          color="#efe9fb"
          metalness={0.15}
          roughness={0.42}
          clearcoat={0.25}
        />
      </mesh>
      <mesh position={[0, 0.5, depth * 0.58]}>
        <boxGeometry args={[width * 0.72, 0.44, 0.05]} />
        <meshPhysicalMaterial
          color="#dbe8f7"
          metalness={0.25}
          roughness={0.1}
          transmission={0.25}
          transparent
          opacity={glow ? 0.85 : 0.6}
          emissive={accent}
          emissiveIntensity={glow ? 0.5 : 0.12}
        />
      </mesh>
    </group>
  );
}

// Mai 2 tang (roof crown) + anten + den hieu tren dinh - thay cho mai bang
// phang truoc day, tao diem nhan kien truc thay vi 1 nap hop don gian.
function RoofCrown({
  width,
  depth,
  height,
  accent,
  active,
  hovered,
}: {
  width: number;
  depth: number;
  height: number;
  accent: string;
  active: boolean;
  hovered: boolean;
}) {
  return (
    <group>
      <mesh position={[0, height + 0.07, 0]}>
        <boxGeometry args={[width + 0.15, 0.12, depth + 0.15]} />
        <meshStandardMaterial
          color="#efe9fb"
          metalness={0.3}
          roughness={0.3}
          emissive={accent}
          emissiveIntensity={active ? 0.8 : hovered ? 0.45 : 0.15}
        />
      </mesh>
      <mesh position={[0, height + 0.28, 0]}>
        <boxGeometry args={[width * 0.5, 0.3, depth * 0.5]} />
        <meshPhysicalMaterial
          color="#f3eefc"
          metalness={0.2}
          roughness={0.3}
          clearcoat={0.3}
        />
      </mesh>
      <mesh position={[0, height + 0.46, 0]}>
        <boxGeometry args={[width * 0.38, 0.03, depth * 0.38]} />
        <meshBasicMaterial color={accent} />
      </mesh>
      <mesh position={[0, height + 0.76, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.6, 8]} />
        <meshBasicMaterial color={accent} />
      </mesh>
      <mesh position={[0, height + 1.08, 0]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshBasicMaterial color={accent} />
      </mesh>
    </group>
  );
}

function BuildingMesh({
  item,
  selected,
  onSelect,
}: {
  item: Building;
  selected: Building | null;
  onSelect: (b: Building) => void;
}) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const active = selected?.id === item.id;

  useFrame((_, dt) => {
    if (!ref.current) return;
    const y = active ? 0.18 : hovered ? 0.07 : 0;
    ref.current.position.y = THREE.MathUtils.lerp(
      ref.current.position.y,
      y,
      1 - Math.pow(0.001, dt),
    );
    const scale = active ? 1.06 : hovered ? 1.035 : 1;
    ref.current.scale.lerp(
      new THREE.Vector3(scale, scale, scale),
      1 - Math.pow(0.001, dt),
    );
  });

  const accent = item.color;
  const glow = active || hovered;
  const half = 1.15; // = width/2, voi width toa nha = 2.3
  const clearingRadius = 1.55 + item.h * 0.08;

  return (
    <group
      ref={ref}
      position={item.pos}
      onPointerEnter={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerLeave={() => {
        setHovered(false);
        document.body.style.cursor = "default";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(item);
      }}
    >
      {/* San co xen quanh chan toa nha */}
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[clearingRadius, 40]} />
        <meshStandardMaterial color="#d8f0d2" roughness={0.95} />
      </mesh>

      {/* Vong glow duoi chan - dam hon khi hover/active, tao cam giac "ha canh" */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[clearingRadius, clearingRadius + 0.2, 48]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={active ? 0.35 : hovered ? 0.2 : 0.08}
        />
      </mesh>

      {/* Loi ket cau (structural core) - opaque, phan lon bi che boi curtain
          wall o mat truoc/ben, chi lo ra o 2 mat con lai va vien tren/duoi */}
      <mesh position={[0, item.h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[half * 2, item.h, half * 2]} />
        <meshStandardMaterial
          color={glow ? "#f3eefc" : "#e8e2f5"}
          metalness={0.08}
          roughness={0.6}
        />
      </mesh>

      {/* Curtain wall that: mat truoc + mat ben, moi mat la luoi panel kinh
          rieng + mullion, khong con la 1 mat phang kinh duy nhat */}
      <GlassFace
        width={half * 2}
        height={item.h}
        offset={[0, 0, half + 0.02]}
        rotation={[0, 0, 0]}
        color={accent}
        glow={glow}
      />
      <GlassFace
        width={half * 2}
        height={item.h}
        offset={[half + 0.02, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        color={accent}
        glow={glow}
      />

      {/* Dai LED doc 2 canh - diem accent sang, giong bien toa nha hien dai */}
      {[-half + 0.02, half - 0.02].map((x) => (
        <mesh key={x} position={[x, item.h / 2, half + 0.05]}>
          <boxGeometry args={[0.025, item.h + 0.1, 0.025]} />
          <meshBasicMaterial color={accent} />
        </mesh>
      ))}

      {/* Tang de (podium) + sanh kinh phat sang */}
      <Podium width={half * 2} depth={half * 2} accent={accent} glow={glow} />
      <pointLight
        position={[0, 0.7, half * 1.16]}
        color={accent}
        intensity={active ? 2.4 : hovered ? 1.3 : 0.35}
        distance={3}
      />

      {/* Mai 2 tang (roof crown) + anten + den hieu */}
      <RoofCrown
        width={half * 2}
        depth={half * 2}
        height={item.h}
        accent={accent}
        active={active}
        hovered={hovered}
      />

      <Float
        speed={1.2}
        rotationIntensity={0}
        floatIntensity={active ? 0.15 : 0.02}
      >
        <Text
          position={[0, item.h + 1.35, 0]}
          fontSize={0.3}
          color="#2a2140"
          anchorX="center"
        >
          {item.name.toUpperCase()}
        </Text>
        <Text
          position={[0, item.h + 1.05, 0]}
          fontSize={0.12}
          color={accent}
          anchorX="center"
        >
          {formatCompact(item.memberCount)} THÀNH VIÊN · {item.channelCount} KÊNH
        </Text>
      </Float>

      {glow && (
        <pointLight
          position={[0, item.h * 0.65, 0]}
          color={accent}
          intensity={active ? 3.5 : 1.6}
          distance={7}
        />
      )}
    </group>
  );
}

// Hieu ung camera zoom "cinematic" vao cua toa nha khi chon - chay xong goi
// onComplete() de dieu huong sang trang chi tiet community that.
function CinematicEnter({
  building,
  onComplete,
}: {
  building: Building;
  onComplete: () => void;
}) {
  const { camera, controls } = useThree();
  const progress = useRef(0);
  const finished = useRef(false);
  const start = useRef<number | null>(null);
  const target = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const door = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (finished.current) return;
    if (start.current === null) start.current = performance.now();
    const elapsed = (performance.now() - start.current) / 1000;
    progress.current = Math.min(elapsed / 1.4, 1);
    const eased = 1 - Math.pow(1 - progress.current, 4);

    door.set(building.pos[0], building.h * 0.48, building.pos[2] + 1.12);
    target.set(
      THREE.MathUtils.lerp(building.pos[0] + 7.5, door.x, eased),
      THREE.MathUtils.lerp(building.h + 7, door.y + 0.15, eased),
      THREE.MathUtils.lerp(building.pos[2] + 8.5, door.z - 0.22, eased),
    );

    camera.position.lerp(target, 0.32);
    look.lerp(door, 0.28);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctl = controls as any;
    if (ctl?.target) {
      ctl.target.copy(look);
      ctl.update();
    }

    if (progress.current >= 1 && !finished.current) {
      finished.current = true;
      onComplete();
    }
  });

  return null;
}

// PRNG seeded (mulberry32) - THUAN (cung seed -> cung ket qua), khac
// Math.random() truc tiep trong render se bi React Compiler bao "impure
// function" (co the cho ket qua khac nhau giua 2 lan goi cung 1 input, vi
// pham quy tac render phai idempotent). Chi dung de rai vi tri co, khong can
// bao mat.
function mulberry32(seed: number) {
  let t = seed;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// Cac vong dong tam cua campus, suy TU VI TRI TOA NHA THAT (khong hardcode
// nhu ban goc), de campus tu gian no theo so luong community:
//   block  (blockHalfW/D)  - vung chua toan bo toa nha + walkway noi bo
//   street (streetHalfW/D) - duong chinh (NYCStreet) chay VONG NGOAI block,
//                            KHONG con chay xuyen qua vi tri toa nha nua
//   san    (halfW/D)       - toan bo mat co + vien cay + toa nha nen o xa
function campusLayout(buildings: Building[]) {
  const xs = Array.from(new Set(buildings.map((b) => b.pos[0]))).sort(
    (a, b) => a - b,
  );
  const zs = Array.from(new Set(buildings.map((b) => b.pos[2]))).sort(
    (a, b) => a - b,
  );
  const maxAbsX = buildings.reduce((m, b) => Math.max(m, Math.abs(b.pos[0])), 0);
  const maxAbsZ = buildings.reduce((m, b) => Math.max(m, Math.abs(b.pos[2])), 0);
  const blockHalfW = Math.max(6, maxAbsX + 2.8);
  const blockHalfD = Math.max(6, maxAbsZ + 2.8);
  const streetHalfW = blockHalfW + 1.5;
  const streetHalfD = blockHalfD + 1.5;
  return {
    xs,
    zs,
    blockHalfW,
    blockHalfD,
    streetHalfW,
    streetHalfD,
    halfW: streetHalfW + 6,
    halfD: streetHalfD + 6,
  };
}

// San co procedural: 1 mat phang nen + cac blade co dang cone, render qua
// <Instances> (1 draw call cho toan bo blade, thay vi 1 <mesh> rieng/blade -
// gia re hon nhieu ve performance khi so luong len toi vai nghin). Blade
// duoc rai bang PRNG seeded (deterministic) trong pham vi san, TRU vung
// quanh chan moi toa nha (ban kinh = ban kinh khoang "co xen" cua toa nha do,
// xem BuildingMesh) de khong bi chong len vong co xen da co.
function GrassField({
  buildings,
  halfW,
  halfD,
}: {
  buildings: Building[];
  halfW: number;
  halfD: number;
}) {
  const blades = useMemo(() => {
    const rand = mulberry32(1337);
    const items: { x: number; z: number; rotation: number; scale: number }[] =
      [];
    const count = Math.min(1800, Math.round(900 * ((halfW * halfD) / (15 * 13))));
    for (let i = 0; i < count; i++) {
      const x = (rand() - 0.5) * halfW * 2;
      const z = (rand() - 0.5) * halfD * 2;
      const tooClose = buildings.some((b) => {
        const clearing = 1.55 + b.h * 0.08 + 0.3;
        return (x - b.pos[0]) ** 2 + (z - b.pos[2]) ** 2 < clearing * clearing;
      });
      if (tooClose) continue;
      items.push({
        x,
        z,
        rotation: rand() * Math.PI,
        scale: 0.55 + rand() * 0.7,
      });
    }
    return items;
  }, [buildings, halfW, halfD]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[halfW * 2, halfD * 2]} />
        <meshStandardMaterial color="#c3e6bd" roughness={1} />
      </mesh>
      <Instances limit={blades.length} range={blades.length}>
        <coneGeometry args={[0.035, 0.18, 3]} />
        <meshStandardMaterial color="#5f9c58" roughness={1} />
        {blades.map((g, i) => (
          <Instance
            key={i}
            position={[g.x, 0.04, g.z]}
            rotation={[0, g.rotation, 0]}
            scale={g.scale}
          />
        ))}
      </Instances>
    </group>
  );
}

// Duong pho lat da noi cac toa nha - 1 duong doc tai moi gia tri x + 1 duong
// ngang tai moi gia tri z ma co toa nha dung tren do (xs/zs tu campusLayout),
// thay cho gridHelper ky thuat truoc day (nhin nhu ban do editor/simulation
// hon la mot khuon vien truong hoc that).
//
// NYC campus street: asphalt + via he lat tung phien (slab) + le duong + vach
// ke duong dut net - thay cho dai mau be phang truoc day. Mau nhua
// duong/via he/le duong la mau VAT LIEU THAT (asphalt luon toi, be tong via
// he luon xam) nen KHONG doi theo tong sang/toi cua theme tong the - day la
// diem tuong phan co chu y voi bau troi/co pastel xung quanh, khong phai
// quay lai theme toi. Kich thuoc thu nho lai so voi 1 do thi NYC that de vua
// voi khoang cach giua cac toa nha (spacing=6.4, xem layoutBuildings).
function NYCStreet({
  position,
  rotationY = 0,
  length,
  roadWidth = 0.9,
}: {
  position: [number, number, number];
  rotationY?: number;
  length: number;
  roadWidth?: number;
}) {
  const sidewalkW = 0.36;
  const sidewalkOffset = roadWidth / 2 + 0.05 + sidewalkW / 2;
  const curbOffset = roadWidth / 2 + 0.02;
  const slabCount = Math.max(1, Math.ceil(length / 1.1));

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Nhua duong */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.028, 0]} receiveShadow>
        <planeGeometry args={[roadWidth, length]} />
        <meshStandardMaterial color="#3a3d40" roughness={0.92} metalness={0.02} />
      </mesh>

      {/* Vach ke tim duong dut net */}
      {Array.from({ length: Math.floor(length / 0.9) }).map((_, i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.031, -length / 2 + 0.45 + i * 0.9]}
        >
          <planeGeometry args={[0.05, 0.32]} />
          <meshBasicMaterial color="#e8c96a" />
        </mesh>
      ))}

      {/* Via he lat phien + le duong, 2 ben */}
      {[-1, 1].map((side) => (
        <group key={side}>
          {Array.from({ length: slabCount }).map((_, i) => (
            <mesh
              key={i}
              rotation={[-Math.PI / 2, 0, 0]}
              position={[
                side * sidewalkOffset,
                0.03,
                -length / 2 + 0.55 + i * 1.1,
              ]}
            >
              <planeGeometry args={[sidewalkW - 0.03, 1.02]} />
              <meshStandardMaterial color="#b9b3a6" roughness={0.9} />
            </mesh>
          ))}
          <mesh position={[side * curbOffset, 0.045, 0]}>
            <boxGeometry args={[0.04, 0.06, length]} />
            <meshStandardMaterial color="#8c8a83" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Walkway noi bo (khac NYCStreet ben ngoai) - chi la via he lat phien don
// gian, KHONG nhua duong/vach ke/le duong, vi day la loi di bo NOI CAC TOA
// NHA voi nhau trong 1 block, khong phai duong xe chay. Dat tai dung x/z ma
// toa nha dung (giong truoc) nhung gioi han trong pham vi block, khong con
// vuon ra het ca san.
function CampusWalkway({
  position,
  rotationY = 0,
  length,
  width = 0.55,
}: {
  position: [number, number, number];
  rotationY?: number;
  length: number;
  width?: number;
}) {
  const slabCount = Math.max(1, Math.ceil(length / 1.3));
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {Array.from({ length: slabCount }).map((_, i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.026, -length / 2 + 0.65 + i * 1.3]}
        >
          <planeGeometry args={[width, 1.24]} />
          <meshStandardMaterial color="#c9c2b3" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function CampusWalkways({
  xs,
  zs,
  blockHalfW,
  blockHalfD,
}: {
  xs: number[];
  zs: number[];
  blockHalfW: number;
  blockHalfD: number;
}) {
  return (
    <group>
      {xs.map((x) => (
        <CampusWalkway key={`v-${x}`} position={[x, 0, 0]} length={blockHalfD * 2} />
      ))}
      {zs.map((z) => (
        <CampusWalkway
          key={`h-${z}`}
          position={[0, 0, z]}
          rotationY={Math.PI / 2}
          length={blockHalfW * 2}
        />
      ))}
    </group>
  );
}

// Duong pho chinh chay VONG QUANH block (4 doan NYCStreet ghep thanh hinh
// chu nhat) - KHONG con chay xuyen qua vi tri toa nha nhu ban truoc, dung
// nhu gop y "quy hoach urban block" (via he/nhua duong/vach ke that su thuoc
// ve duong bao ngoai, khong phai loi di noi bo).
function CampusPerimeterStreets({
  streetHalfW,
  streetHalfD,
}: {
  streetHalfW: number;
  streetHalfD: number;
}) {
  const roadWidth = 1.1;
  return (
    <group>
      <NYCStreet
        position={[0, 0, -streetHalfD]}
        rotationY={Math.PI / 2}
        length={streetHalfW * 2 + roadWidth}
        roadWidth={roadWidth}
      />
      <NYCStreet
        position={[0, 0, streetHalfD]}
        rotationY={Math.PI / 2}
        length={streetHalfW * 2 + roadWidth}
        roadWidth={roadWidth}
      />
      <NYCStreet
        position={[-streetHalfW, 0, 0]}
        length={streetHalfD * 2 + roadWidth}
        roadWidth={roadWidth}
      />
      <NYCStreet
        position={[streetHalfW, 0, 0]}
        length={streetHalfD * 2 + roadWidth}
        roadWidth={roadWidth}
      />
    </group>
  );
}

// Cay kieu via he do thi (tree pit + than + 1 tan la) - thay cho cay "cong
// vien" 2 tan la truoc day, dung lam hang cay vien quanh san.
function CampusTree({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      {/* O dat trong cay (tree pit) - mau dat, khong doi theo theme */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <circleGeometry args={[0.32, 20]} />
        <meshStandardMaterial color="#5b564a" roughness={1} />
      </mesh>
      <mesh position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.08, 0.84, 8]} />
        <meshStandardMaterial color="#8a6a4f" roughness={1} />
      </mesh>
      <mesh position={[0, 1.02, 0]} castShadow>
        <sphereGeometry args={[0.4, 10, 8]} />
        <meshStandardMaterial color="#7cbf72" roughness={1} />
      </mesh>
    </group>
  );
}

// Vien cay quanh 4 canh san (khong phai hang rao cung nhac - moi cay duoc
// lech nhe vi tri/kich thuoc bang PRNG seeded) - vi tri suy tu halfW/halfD
// (campusLayout) nen tu gian no theo kich thuoc san.
function CampusTrees({
  halfW,
  halfD,
  seedKey,
}: {
  halfW: number;
  halfD: number;
  seedKey: number;
}) {
  const trees = useMemo(() => {
    const rand = mulberry32(4242 + Math.round(seedKey));
    const items: { pos: [number, number, number]; scale: number }[] = [];
    const spacing = 2.3;
    const jitter = () => (rand() - 0.5) * 0.9;
    const scaleOf = () => 0.85 + rand() * 0.5;

    for (let x = -halfW + 1; x <= halfW - 1; x += spacing) {
      items.push({ pos: [x + jitter(), 0, -halfD + jitter()], scale: scaleOf() });
      items.push({ pos: [x + jitter(), 0, halfD + jitter()], scale: scaleOf() });
    }
    for (let z = -halfD + spacing; z <= halfD - spacing; z += spacing) {
      items.push({ pos: [-halfW + jitter(), 0, z + jitter()], scale: scaleOf() });
      items.push({ pos: [halfW + jitter(), 0, z + jitter()], scale: scaleOf() });
    }
    return items;
  }, [halfW, halfD, seedKey]);

  return (
    <group>
      {trees.map((t, i) => (
        <CampusTree key={i} position={t.pos} scale={t.scale} />
      ))}
    </group>
  );
}

// Den duong - dat tai trung diem giua 2 "day pho" lien tiep tren moi cot x
// (xem campusLampPositions), tao cam giac ty le con nguoi cho campus.
function CampusLamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Cot den */}
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.018, 0.028, 1.4, 8]} />
        <meshStandardMaterial color="#3a3f42" metalness={0.75} roughness={0.3} />
      </mesh>
      {/* Canh tay vuon ra kieu NYC (cantilever) */}
      <mesh position={[0.1, 1.37, 0]}>
        <boxGeometry args={[0.2, 0.02, 0.02]} />
        <meshStandardMaterial color="#3a3f42" metalness={0.75} roughness={0.3} />
      </mesh>
      <mesh position={[0.19, 1.34, 0]}>
        <sphereGeometry args={[0.05, 10, 10]} />
        <meshStandardMaterial color="#fff1c4" emissive="#fff1c4" emissiveIntensity={3.2} />
      </mesh>
      <pointLight position={[0.19, 1.32, 0]} color="#ffe9b8" intensity={0.7} distance={2.8} />
    </group>
  );
}

function campusLampPositions(
  xs: number[],
  zs: number[],
  halfD: number,
): [number, number, number][] {
  if (xs.length === 0) return [];
  const zLines = [-halfD, ...zs, halfD];
  const positions: [number, number, number][] = [];
  for (const x of xs) {
    for (let i = 0; i < zLines.length - 1; i++) {
      positions.push([x, 0, (zLines[i] + zLines[i + 1]) / 2]);
    }
  }
  return positions;
}

// Ghe da don gian - chi dat vai cai gan tam san de tao ty le, khong can nhieu.
function Bench({
  position,
  rotationY = 0,
}: {
  position: [number, number, number];
  rotationY?: number;
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[0.9, 0.06, 0.3]} />
        <meshStandardMaterial color="#a9825f" roughness={0.8} />
      </mesh>
      {[-0.35, 0.35].map((x) => (
        <mesh key={x} position={[x, 0.14, 0]}>
          <boxGeometry args={[0.06, 0.28, 0.06]} />
          <meshStandardMaterial color="#8b8398" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

// Toa nha nen o xa (chi la silhouette, KHONG phai community that) - chi de
// campus co boi canh/chieu sau thay vi ket thuc dot ngot o vien cay.
function BackgroundBuilding({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[2.6, 3.2, 1.6]} />
        <meshStandardMaterial color="#d9d2ef" roughness={0.7} />
      </mesh>
      {[-0.7, 0, 0.7].map((x) => (
        <mesh key={x} position={[x, 1.6, 0.82]}>
          <boxGeometry args={[0.5, 2.2, 0.02]} />
          <meshStandardMaterial color="#cfe3f5" metalness={0.2} roughness={0.25} />
        </mesh>
      ))}
    </group>
  );
}

// Skyline nen o xa - rai bang PRNG seeded quanh 4 canh san (thay vi 3 vi tri
// hardcode truoc day), khoang cach/scale tang dan ra xa de tao chieu sau,
// van tu gian no theo halfW/halfD (kich thuoc san THAT).
function CampusBackground({
  halfW,
  halfD,
  seedKey,
}: {
  halfW: number;
  halfD: number;
  seedKey: number;
}) {
  const buildings = useMemo(() => {
    const rand = mulberry32(7331 + Math.round(seedKey));
    const items: { pos: [number, number, number]; scale: number }[] = [];
    const perSide = Math.max(3, Math.round((halfW + halfD) / 9));
    for (let ring = 0; ring < 2; ring++) {
      const dist = 2.5 + ring * 5.5;
      const scale = 0.9 - ring * 0.25;
      for (let i = 0; i < perSide; i++) {
        const t = (i / perSide) * Math.PI * 2 + rand() * 0.4;
        const rx = (halfW + dist) * Math.cos(t);
        const rz = (halfD + dist) * Math.sin(t);
        items.push({ pos: [rx, 0, rz], scale: scale * (0.85 + rand() * 0.3) });
      }
    }
    return items;
  }, [halfW, halfD, seedKey]);

  return (
    <group>
      {buildings.map((b, i) => (
        <BackgroundBuilding key={i} position={b.pos} scale={b.scale} />
      ))}
    </group>
  );
}

// Cay ran rac o "san vuon" giua vong duong chinh va vien cay ngoai cung (xem
// CampusTrees) - lam campus co chieu sau/mat do cay xanh thay vi chi 1 hang
// mong o rat xa. Tranh block (noi toa nha dung) va hanh lang duong chinh
// (streetHalfW/D +- streetBuffer) de khong chong len duong/via he.
function CampusLandscape({
  blockHalfW,
  blockHalfD,
  streetHalfW,
  streetHalfD,
  halfW,
  halfD,
  seedKey,
}: {
  blockHalfW: number;
  blockHalfD: number;
  streetHalfW: number;
  streetHalfD: number;
  halfW: number;
  halfD: number;
  seedKey: number;
}) {
  const trees = useMemo(() => {
    const rand = mulberry32(9001 + Math.round(seedKey));
    const items: { pos: [number, number, number]; scale: number }[] = [];
    const streetBuffer = 1.1;
    const target = Math.max(12, Math.round(60 * ((halfW * halfD) / (20 * 18))));
    let guard = 0;
    while (items.length < target && guard < target * 12) {
      guard++;
      const x = (rand() - 0.5) * halfW * 2 * 0.94;
      const z = (rand() - 0.5) * halfD * 2 * 0.94;
      if (Math.abs(x) < blockHalfW && Math.abs(z) < blockHalfD) continue;
      const onStreetX = Math.abs(Math.abs(x) - streetHalfW) < streetBuffer;
      const onStreetZ = Math.abs(Math.abs(z) - streetHalfD) < streetBuffer;
      if (onStreetX || onStreetZ) continue;
      items.push({ pos: [x, 0, z], scale: 0.7 + rand() * 0.7 });
    }
    return items;
  }, [blockHalfW, blockHalfD, streetHalfW, streetHalfD, halfW, halfD, seedKey]);

  return (
    <group>
      {trees.map((t, i) => (
        <CampusTree key={i} position={t.pos} scale={t.scale} />
      ))}
    </group>
  );
}

// Nguoi don gian (capsule + dau) - chi de tao ty le con nguoi cho campus,
// khong can chi tiet.
function Person({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.42, 0]} castShadow>
        <capsuleGeometry args={[0.09, 0.35, 4, 8]} />
        <meshStandardMaterial color="#405b70" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.82, 0]} castShadow>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#d6a47a" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Scene({
  buildings,
  selected,
  entering,
  onSelect,
  onEnterComplete,
}: {
  buildings: Building[];
  selected: Building | null;
  entering: boolean;
  onSelect: (b: Building) => void;
  onEnterComplete: () => void;
}) {
  const layout = useMemo(() => campusLayout(buildings), [buildings]);
  // zLines gioi han trong blockHalfD (khong phai halfD ca san) - den/ghe chi
  // nam doc walkway NOI BO trong block, khong vuon ra het ca san.
  const lamps = useMemo(
    () => campusLampPositions(layout.xs, layout.zs, layout.blockHalfD),
    [layout],
  );
  // Chi lay 1 vai vi tri den lam ghe (khong can nhieu) - vi tri lech sang 2
  // ben duong doc dau tien de khong chan loi di.
  const benchSpots = lamps.slice(0, 4);
  // Nguoi di bo - lech nhe khoi vi tri den bang PRNG seeded, chi de tao ty
  // le con nguoi, khong can nhieu.
  const people = useMemo(() => {
    const rand = mulberry32(555 + buildings.length);
    return lamps.slice(0, 5).map(
      (p) =>
        [
          p[0] + (rand() - 0.5) * 1.4,
          p[1],
          p[2] + (rand() - 0.5) * 1.4,
        ] as [number, number, number],
    );
  }, [lamps, buildings.length]);
  const fogFar = layout.halfW + layout.halfD + 10;
  const fogNear = layout.streetHalfD + 4;

  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [15, 11, 17], fov: 42, near: 0.1, far: fogFar + 40 }}
    >
      <color attach="background" args={["#f5f1fc"]} />
      <fog attach="fog" args={["#f5f1fc", fogNear, fogFar]} />
      <ambientLight intensity={0.9} />
      <hemisphereLight
        color="#e0d4fb"
        groundColor="#cdeecb"
        intensity={0.55}
      />
      <directionalLight
        position={[8, 14, 10]}
        intensity={1.9}
        color="#fff3e0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-layout.halfW}
        shadow-camera-right={layout.halfW}
        shadow-camera-top={layout.halfD}
        shadow-camera-bottom={-layout.halfD}
      />
      <directionalLight position={[-8, 7, -5]} intensity={0.7} color="#a8c0e8" />
      <GrassField buildings={buildings} halfW={layout.halfW} halfD={layout.halfD} />
      <CampusWalkways
        xs={layout.xs}
        zs={layout.zs}
        blockHalfW={layout.blockHalfW}
        blockHalfD={layout.blockHalfD}
      />
      <CampusPerimeterStreets
        streetHalfW={layout.streetHalfW}
        streetHalfD={layout.streetHalfD}
      />
      <CampusLandscape
        blockHalfW={layout.blockHalfW}
        blockHalfD={layout.blockHalfD}
        streetHalfW={layout.streetHalfW}
        streetHalfD={layout.streetHalfD}
        halfW={layout.halfW}
        halfD={layout.halfD}
        seedKey={buildings.length}
      />
      <CampusTrees halfW={layout.halfW} halfD={layout.halfD} seedKey={buildings.length} />
      <CampusBackground halfW={layout.halfW} halfD={layout.halfD} seedKey={buildings.length} />
      {lamps.map((p, i) => (
        <CampusLamp key={i} position={[p[0] - 0.95, p[1], p[2]]} />
      ))}
      {lamps.map((p, i) => (
        <CampusLamp key={`b-${i}`} position={[p[0] + 0.95, p[1], p[2]]} />
      ))}
      {benchSpots.map((p, i) => (
        <Bench
          key={i}
          position={[p[0] + 1.2, p[1], p[2]]}
          rotationY={Math.PI / 2}
        />
      ))}
      {people.map((p, i) => (
        <Person key={i} position={p} />
      ))}
      {buildings.map((b) => (
        <BuildingMesh key={b.id} item={b} selected={selected} onSelect={onSelect} />
      ))}
      <OrbitControls
        makeDefault
        enabled={!entering}
        enablePan
        dampingFactor={0.08}
        minDistance={8}
        maxDistance={38}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 2.15}
        target={[0, 1.5, 0]}
        enableDamping
      />
      {entering && selected && (
        <CinematicEnter building={selected} onComplete={onEnterComplete} />
      )}
      <Environment preset="dawn" />
    </Canvas>
  );
}

// Man "Campus" - moi Community la 1 toa nha 3D, click vao se zoom-in
// cinematic roi dieu huong thang toi /communities/[slug] (trang chi tiet da
// co san, khong bia man "Building" rieng). Client-only (WebGL) - luon duoc
// import qua next/dynamic {ssr:false} tu page.tsx.
export function CommunityCampus3D({
  communities,
  label = "01 · Digital Campus",
  hint = "Click vào 1 tòa nhà để vào cộng đồng",
  emptyLabel = "Chưa có cộng đồng nào.",
}: {
  communities: ApiCommunitySummary[];
  // Nhan goc trai + trang thai rong - cho phep tuy bien khi trang render
  // NHIEU khung campus cung luc (vd: chia doi "nua tren"/"nua duoi" kep
  // giua hero, xem communities/page.tsx) de moi khung co nhan rieng biet.
  label?: string;
  hint?: string;
  emptyLabel?: string;
}) {
  const router = useRouter();
  const buildings = useMemo(() => layoutBuildings(communities), [communities]);
  const [selected, setSelected] = useState<Building | null>(null);
  const [entering, setEntering] = useState(false);

  if (buildings.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-ink-faint">
        {emptyLabel}
      </p>
    );
  }

  return (
    <div
      className="relative h-140 w-full overflow-hidden rounded-xl border border-border"
      style={{
        background:
          "linear-gradient(135deg, #ede9fe 0%, #fdf2f8 55%, #eff6ff 100%)",
      }}
    >
      <Scene
        buildings={buildings}
        selected={selected}
        entering={entering}
        onSelect={(b) => {
          if (entering) return;
          setSelected(b);
          setEntering(true);
        }}
        onEnterComplete={() => {
          router.push(`/communities/${selected!.slug}`);
        }}
      />

      <div className="pointer-events-none absolute top-4 left-4 flex flex-col gap-0.5">
        <span className="text-[11px] font-semibold tracking-widest text-community-accent uppercase">
          {label}
        </span>
        <span className="text-[11px] text-ink-faint">{hint}</span>
      </div>

      {entering && selected && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/70 backdrop-blur-[1px]">
          <div className="size-8 animate-spin rounded-full border-2 border-community-accent/25 border-t-community-accent" />
          <span className="text-xs font-semibold tracking-widest text-ink uppercase">
            Đang vào {selected.name}
          </span>
        </div>
      )}
    </div>
  );
}
