"use server";
import { getNodeCards } from "@/lib/api/cards";

export async function getNodeCardsAction(nodeId: string) {
  return getNodeCards(nodeId);
}
//Đây là Server Action dùng để đọc (không phải mutation)
// — cần thiết vì node-detail-panel.tsx là client component, không thể gọi thẳng lib/api/*
// do biến CAREER_TREE_API_URL chỉ tồn tại phía server (không có tiền tố NEXT_PUBLIC_). Đây là cách dùng Server Action hợp lệ và phổ biến trong Next.js kể cả khi không mutate gì — chỉ để lấy dữ liệu server-side theo yêu cầu tương tác từ client
