// Trich dan trang tri thuan tuy (khong dai dien so lieu nguoi dung) - xoay
// theo ngay-trong-nam (on dinh trong 1 ngay). Goi pickDailyQuote() TREN
// SERVER (page.tsx) roi truyen xuong HomeQuoteCard nhu 1 Server Component -
// khong tinh trong client de tranh rui ro lech ngay giua server/client khi 2
// ben cross qua nua dem o timezone khac nhau (hydration mismatch tiem an).
const QUOTES: [string, string][] = [
  ["Small steps every day lead to big changes.", "Khuyết danh"],
  ["Một trang mỗi ngày, một năm sẽ có một cuốn sách.", "Khuyết danh"],
  ["Kỷ luật là cầu nối giữa mục tiêu và thành tựu.", "Jim Rohn"],
  ["Đường dài nhất bắt đầu bằng một bước chân.", "Lão Tử"],
  ["Kiến thức càng chia sẻ càng lớn.", "Khuyết danh"],
];

function dayOfYear(): number {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 0));
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
}

export function pickDailyQuote(): { quote: string; author: string } {
  const [quote, author] = QUOTES[dayOfYear() % QUOTES.length];
  return { quote, author };
}
