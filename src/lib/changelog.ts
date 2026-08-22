// Nhat ky cap nhat TINH (khong co CMS/backend rieng cho changelog) - danh
// sach nay do dev tu cap nhat moi khi ship tinh nang moi, tuong tu 1
// CHANGELOG.md hien thi trong app. `id` dung de so sanh voi
// "changelog-last-seen" trong localStorage (xem UpdatesPanel.tsx) - the moi
// nhat luon dat DAU MANG.
export type ChangelogEntry = {
  id: string;
  date: string; // "yyyy-MM-dd", chi hien thi, khong dung de sap xep (mang da theo thu tu moi nhat truoc)
  title: string;
  description: string;
};

export const CHANGELOG: ChangelogEntry[] = [
  {
    id: "2026-08-22-group-chat",
    date: "2026-08-22",
    title: "Nhóm chat",
    description:
      "Tạo nhóm chat với nhiều bạn bè cùng lúc - chọn màu đại diện, đặt tên nhóm, thêm thành viên từ danh bạ hoặc tìm kiếm.",
  },
  {
    id: "2026-08-22-reactions-reply-recall",
    date: "2026-08-22",
    title: "Cảm xúc, trả lời & thu hồi tin nhắn",
    description:
      "Thả cảm xúc lên tin nhắn, trả lời trích dẫn 1 tin cụ thể, và thu hồi tin nhắn đã gửi nhầm.",
  },
  {
    id: "2026-08-21-attachments",
    date: "2026-08-21",
    title: "Ảnh, file, GIF & tin nhắn thoại",
    description:
      "Gửi ảnh, tệp đính kèm, GIF (Giphy) và ghi âm tin nhắn thoại ngay trong khung chat.",
  },
  {
    id: "2026-08-21-poll",
    date: "2026-08-21",
    title: "Bình chọn trong chat",
    description: "Tạo bình chọn nhanh để cả nhóm cùng quyết định.",
  },
  {
    id: "2026-08-21-search-favorite",
    date: "2026-08-21",
    title: "Tìm kiếm tin nhắn & đánh dấu yêu thích",
    description:
      "Tìm lại tin nhắn cũ trong 1 hội thoại, và đánh dấu hội thoại quan trọng vào mục Yêu thích.",
  },
  {
    id: "2026-08-20-realtime",
    date: "2026-08-20",
    title: "Trạng thái hoạt động & đã xem",
    description:
      "Xem ai đang trực tuyến, ai đang nhập tin nhắn, và tin nhắn đã được xem hay chưa - theo thời gian thực.",
  },
];
