// Rang buoc upload anh THAT (spec: "Image upload có limit size 5MB, format
// jpg/png/webp") - dung chung boi BlockModal.tsx (tool "Ảnh") va
// StickerLibraryPopover.tsx (Sub-phase 6.6, upload sticker tuy chinh), tach
// rieng file de tranh khai bao trung lap khi ca 2 noi cung can.
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
