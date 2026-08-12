// PRNG seed co dinh (khong phai Math.random()) - dung cho moi noi can vi tri
// ngau nhien GIONG HET nhau giua server render va client hydrate (component
// "use client" van duoc SSR lan dau boi Next.js), tranh hydration mismatch.
// Rut ra tu WorkspaceSwitcher.tsx (STARS cua man chon workspace) de dung
// chung voi StarfieldBackground.tsx.
export function mulberry32(seed: number) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
