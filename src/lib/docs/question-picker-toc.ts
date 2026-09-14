import { slugifyHeading } from "./docs-toc";

export type QuestionPickerTocItem = { id: string; question: string; description: string };

// Bo markdown emphasis/link co ban de hien PLAIN TEXT trong 1 the preview
// nho (khong can render markdown that trong 1 cai the tom tat).
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .trim();
}

// Quet TOAN BO heading H2 (CHI "## ", khong lay H3 - yeu cau nguoi dung:
// "chỉ bắt theo h2 thôi nhé") tu 1 chuoi markdown THAT (contentMarkdown cua
// Series Entry) - dung TRUC TIEP tren markdown (khong qua Tiptap doc) vi
// Series Entry luu markdown STRING, khac Post (Tiptap JSON). `id` dung
// CHUNG 1 ham slugifyHeading voi extractDocsToc/DocsMarkdown.tsx de khop
// CHINH XAC voi id THAT ma heading do duoc gan trong trang - cho phep box
// la 1 LINK NHAY THANG toi dung section, khong chi hien text tinh.
//
// Item nay LA TU DONG (khong can chen tay qua Composer/Series editor toolbar
// nua) - yeu cau nguoi dung sau khi hoi lai nhieu lan: "Với cả 4 button toc
// đâu ???? Bắt theo h2 đâu ?" (mong doi tinh nang tu xuat hien tren MOI
// trang Entry co H2, khong phai 1 khoi phai chu dong chen).
export function extractQuestionPickerToc(markdown: string): QuestionPickerTocItem[] {
  const lines = markdown.split("\n");
  const items: QuestionPickerTocItem[] = [];
  const seen = new Map<string, number>();

  for (let i = 0; i < lines.length; i++) {
    const match = /^##\s+(.+)$/.exec(lines[i].trim());
    if (!match) continue;

    const rawHeading = match[1].trim();
    const question = stripMarkdown(rawHeading);
    let id = slugifyHeading(rawHeading);
    const count = seen.get(id) ?? 0;
    seen.set(id, count + 1);
    if (count > 0) id = `${id}-${count}`;

    // Mo ta ngan = dong VAN BAN khong rong DAU TIEN sau heading nay (bo qua
    // dong trong) - dung lai neu gap 1 heading khac truoc khi thay text nao
    // (khong co gi de lam mo ta).
    let description = "";
    for (let j = i + 1; j < lines.length; j++) {
      const line = lines[j].trim();
      if (!line) continue;
      if (/^#{1,6}\s/.test(line)) break;
      description = stripMarkdown(line);
      break;
    }

    items.push({ id, question, description });
  }

  return items;
}
