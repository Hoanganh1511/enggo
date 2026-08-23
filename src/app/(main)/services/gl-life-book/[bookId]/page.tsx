import { BookOpen } from "lucide-react";
import { getBook } from "@/lib/api/books";
import { LifeBookEditor } from "@/components/services/life-book/LifeBookEditor";

// Phase 1 - fetch book o SERVER (title/pages/blocks that tu backend), truyen
// xuong <LifeBookEditor /> (client) de hydrate vao useBookStore. UI hien tai
// CHI la JSON viewer + vai nut test (xem LifeBookEditor.tsx) - se thay dan
// thanh sach lat trang that o Phase 2/3.
//
// `book.isOpen` (mac dinh false, xem Book model o backend) - editor con dang
// xay dang do (Phase 6) va toan bo BooksController hien @Public() khong co
// auth, nen chan truy cap cong khai qua cong tac nay cho den khi that su san
// sang cong bo. Hien placeholder trung thuc "Sap ra mat" (giong
// services/[slug]/page.tsx dung cho 6 dich vu GL con lai) thay vi mo thang
// editor.
export default async function LifeBookPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  const book = await getBook(bookId);

  if (!book.isOpen) {
    return (
      <div className="container px-6 py-16">
        <div className="mx-auto mt-10 flex max-w-md flex-col items-center text-center">
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-rose-500">
            <BookOpen size={30} className="text-white" strokeWidth={2} />
          </span>
          <h1 className="mt-5 text-2xl font-extrabold text-ink">GL Life Book</h1>
          <p className="mt-2 text-sm text-ink-muted">
            Cuốn sổ tay số hoá cuộc đời bạn - dạng tạp chí lật trang.
          </p>

          <span className="mt-6 rounded-full bg-surface-muted px-4 py-1.5 text-xs font-semibold text-ink-muted">
            Sắp ra mắt
          </span>
          <p className="mt-3 text-xs text-ink-faint">
            Chúng tôi đang xây dựng công cụ này — quay lại sau nhé!
          </p>
        </div>
      </div>
    );
  }

  return <LifeBookEditor book={book} />;
}
