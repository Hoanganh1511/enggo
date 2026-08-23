// Sub-phase 6.5 - danh sach font CO SAN (Google Fonts that, khong phai
// placeholder) cho dropdown "Font chu" trong PropertiesPanel.tsx. `family`
// la gia tri dung TRUC TIEP trong Konva.Text.fontFamily (co fallback generic
// san), `googleParam` la tham so family truyen vao Google Fonts CSS2 API de
// tai font THAT ve trinh duyet.
export const GOOGLE_FONT_OPTIONS = [
  { label: "Inter", family: "Inter, sans-serif", googleParam: "Inter:wght@400;700" },
  {
    label: "Playfair Display",
    family: "'Playfair Display', serif",
    googleParam: "Playfair+Display:wght@400;700",
  },
  {
    label: "Roboto Slab",
    family: "'Roboto Slab', serif",
    googleParam: "Roboto+Slab:wght@400;700",
  },
  { label: "Poppins", family: "Poppins, sans-serif", googleParam: "Poppins:wght@400;700" },
  {
    label: "Merriweather",
    family: "Merriweather, serif",
    googleParam: "Merriweather:wght@400;700",
  },
  {
    label: "JetBrains Mono",
    family: "'JetBrains Mono', monospace",
    googleParam: "JetBrains+Mono:wght@400;700",
  },
];

const loadedFontIds = new Set<string>();

// Chen 1 the <link> THAT vao <head> de trinh duyet tai font tu Google Fonts -
// khong phai gia lap (chi doi ten fontFamily ma khong nap font that, chu THAT
// se hien thi sai font/dung fallback). Idempotent - goi lai voi cung
// `googleParam` khong chen trung the.
export function ensureGoogleFontLoaded(googleParam: string): void {
  if (loadedFontIds.has(googleParam)) return;
  loadedFontIds.add(googleParam);
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${googleParam}&display=swap`;
  document.head.appendChild(link);
}
