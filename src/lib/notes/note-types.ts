// 6 loai Note - yeu cau nguoi dung (spec "My Notes"): "đừng chỉ có một loại
// Note" - moi loai co icon/nhan/mau rieng de phan biet nhanh trong panel va
// o marker le bai viet (xem NotesPanel.tsx, ArticleNoteMarkers.tsx). Dung
// EMOJI lam icon (khop CHINH XAC spec nguoi dung gui, khong doi sang lucide)
// vi spec liet ke ro tung emoji cho tung loai.
export type NoteType = "keyPoint" | "insight" | "watchOut" | "question" | "connection" | "personal";

export type NoteTypeConfig = {
  id: NoteType;
  label: string;
  icon: string;
  // Mau accent rieng cho tung loai (dung cho chip loc/marker le) - mau CO
  // DINH theo loai (khac Card Color System cua CardGrid: o day mau la
  // SEMANTIC theo Y NGHIA loai note, khong phai "identity" tuy chon).
  color: string;
  colorSoft: string;
};

export const NOTE_TYPES: NoteTypeConfig[] = [
  { id: "keyPoint", label: "Key Point", icon: "⭐", color: "#D97706", colorSoft: "#FFF4D9" },
  { id: "insight", label: "Important Insight", icon: "💡", color: "#2563EB", colorSoft: "#EAF2FF" },
  { id: "watchOut", label: "Watch Out", icon: "⚠️", color: "#DC2626", colorSoft: "#FFE9E9" },
  { id: "question", label: "Question", icon: "❓", color: "#7C3AED", colorSoft: "#F1EAFF" },
  { id: "connection", label: "Connection", icon: "🔗", color: "#0891B2", colorSoft: "#E3F8FC" },
  { id: "personal", label: "Personal Note", icon: "📝", color: "#4B5563", colorSoft: "#F1F2F4" },
];

const NOTE_TYPE_BY_ID = new Map(NOTE_TYPES.map((t) => [t.id, t] as const));

export function getNoteTypeConfig(id: NoteType): NoteTypeConfig {
  return NOTE_TYPE_BY_ID.get(id) ?? NOTE_TYPES[5];
}
