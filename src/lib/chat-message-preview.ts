import type { ApiChatMessage } from "./api/types";

// Dung chung cho: preview trong danh sach hoi thoai, browser Notification khi
// tab khong focus - IMAGE/FILE/VOICE/GIF/POLL khong co `content` van can 1
// dong text ngan mo ta thay vi hien rong.
export function formatMessagePreview(
  m: Pick<ApiChatMessage, "type" | "content" | "poll">,
): string {
  switch (m.type) {
    case "IMAGE":
      return "[Hình ảnh]";
    case "GIF":
      return "[GIF]";
    case "FILE":
      return "[Tệp đính kèm]";
    case "VOICE":
      return "[Tin nhắn thoại]";
    case "POLL":
      return `[Bình chọn] ${m.poll?.question ?? ""}`;
    default:
      return m.content ?? "";
  }
}
