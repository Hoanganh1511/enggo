// Dinh vi lai 1 doan text da bo "Note"/highlight VAO trong noi dung bai viet
// da render (DOM), KHONG dua vao offset ProseMirror/markdown (Entry render
// qua rehype tu contentMarkdown, cau truc DOM co the doi nhe giua cac lan
// build) - dung "quote + prefix/suffix" (giong cach Web Annotation/hypothes.is
// lam) thay vi luu offset so: ben vung hon voi thay doi nho trong noi dung,
// va prefix/suffix giup phan biet khi quoteText xuat hien NHIEU LAN trong
// cung 1 bai.
const CONTEXT_CHARS = 32;

export type SelectionQuote = {
  quoteText: string;
  quotePrefix: string;
  quoteSuffix: string;
};

// Doc lua chon hien tai cua nguoi dung (window.getSelection()) - chi tra ve
// ket qua neu lua chon nam HOAN TOAN trong `containerEl` (vd than bai viet,
// khong tinh text bam nham o sidebar/toolbar) va khong rong.
export function getSelectionQuote(containerEl: HTMLElement): SelectionQuote | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null;
  const range = sel.getRangeAt(0);
  if (!containerEl.contains(range.commonAncestorContainer)) return null;

  const quoteText = range.toString().trim();
  if (!quoteText) return null;

  const fullText = containerEl.textContent ?? "";
  const preRange = range.cloneRange();
  preRange.selectNodeContents(containerEl);
  preRange.setEnd(range.startContainer, range.startOffset);
  const startIndex = preRange.toString().length;
  const endIndex = startIndex + quoteText.length;

  return {
    quoteText,
    quotePrefix: fullText.slice(Math.max(0, startIndex - CONTEXT_CHARS), startIndex),
    quoteSuffix: fullText.slice(endIndex, endIndex + CONTEXT_CHARS),
  };
}

export function getSelectionRect(): DOMRect | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null;
  return sel.getRangeAt(0).getBoundingClientRect();
}

// Tim lai 1 Range khop voi quote (+prefix/suffix de chon dung lan xuat hien,
// neu quoteText lap lai nhieu cho trong bai) ben trong `containerEl`. Dung
// TreeWalker quet TOAN BO text node, ghep thanh 1 chuoi "phang" + bang tra
// (node, offset trong node) -> vi tri trong chuoi phang, roi tim chi so
// khop bang indexOf (co the lap lai - uu tien lan khop co prefix/suffix
// dung nhat, fallback ve lan dau tien neu khong co prefix/suffix nao khop).
export function locateQuoteRange(containerEl: HTMLElement, quote: SelectionQuote): Range | null {
  const walker = document.createTreeWalker(containerEl, NodeFilter.SHOW_TEXT);
  const chunks: { node: Text; start: number; end: number }[] = [];
  let full = "";
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const text = node.textContent ?? "";
    if (!text) continue;
    chunks.push({ node: node as Text, start: full.length, end: full.length + text.length });
    full += text;
  }
  if (!full) return null;

  const withContext = quote.quotePrefix + quote.quoteText + quote.quoteSuffix;
  let matchStart = -1;
  // Uu tien khop CA cum prefix+quote+suffix (chinh xac nhat khi quote lap
  // lai), fallback ve khop quoteText DON (lan dau tien) neu khong tim thay.
  const contextIndex = quote.quotePrefix || quote.quoteSuffix ? full.indexOf(withContext) : -1;
  if (contextIndex !== -1) {
    matchStart = contextIndex + quote.quotePrefix.length;
  } else {
    matchStart = full.indexOf(quote.quoteText);
  }
  if (matchStart === -1) return null;
  const matchEnd = matchStart + quote.quoteText.length;

  function resolve(pos: number): { node: Text; offset: number } | null {
    const chunk = chunks.find((c) => pos >= c.start && pos <= c.end);
    if (!chunk) return null;
    return { node: chunk.node, offset: pos - chunk.start };
  }

  const startRef = resolve(matchStart);
  const endRef = resolve(matchEnd);
  if (!startRef || !endRef) return null;

  const range = document.createRange();
  range.setStart(startRef.node, startRef.offset);
  range.setEnd(endRef.node, endRef.offset);
  return range;
}

// Cuon toi + nhap nhay tam thoi 1 doan quote trong bai (yeu cau nguoi dung:
// "khi click note, article tự scroll tới đúng đoạn kiến thức mà bạn đã
// note"). Tra ve true neu tim/cuon duoc, false neu khong (vd quote rong -
// note thu cong, hoac noi dung bai da doi khien khong tim thay nua).
export function scrollToAndFlashQuote(
  containerEl: HTMLElement,
  quote: SelectionQuote,
): boolean {
  if (!quote.quoteText) return false;
  const range = locateQuoteRange(containerEl, quote);
  if (!range) return false;

  const rect = range.getBoundingClientRect();
  const scrollRoot = document.querySelector<HTMLElement>("[data-scroll-root]");
  if (scrollRoot) {
    const rootRect = scrollRoot.getBoundingClientRect();
    const targetTop =
      scrollRoot.scrollTop + (rect.top - rootRect.top) - scrollRoot.clientHeight / 2 + rect.height / 2;
    scrollRoot.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
  } else {
    range.startContainer.parentElement?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // Nhap nhay: boc Range trong 1 <mark> tam thoi roi thao ra sau animation -
  // surroundContents() nem loi neu Range cat ngang 1 the KHONG PHAI text node
  // (vd quote trai dai qua 2 doan van) - bo qua nhap nhay trong truong hop do,
  // cuon toi van hoat dong binh thuong (chi mat phan hieu ung phu).
  try {
    const mark = document.createElement("mark");
    mark.className = "note-quote-flash";
    range.surroundContents(mark);
    setTimeout(() => {
      const parent = mark.parentNode;
      if (!parent) return;
      while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
      parent.removeChild(mark);
      parent.normalize();
    }, 2200);
  } catch {
    // Range cat ngang nhieu the - bo qua hieu ung nhap nhay.
  }
  return true;
}
