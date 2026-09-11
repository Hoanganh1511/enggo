import { getSchema, type Extensions, type JSONContent } from "@tiptap/core";
import { DOMSerializer, Node as ProseMirrorNode } from "@tiptap/pm/model";
import { Window } from "happy-dom";

// Tu viet thay vi dung goi "@tiptap/html" (co san ham generateHTML tuong tu)
// vi goi do bi loi "Cannot read properties of undefined (reading
// 'addExtensions')" ngay khi build schema (getSchema()) - CHI xay ra khi chay
// qua Next.js/Turbopack, khong tai hien duoc khi chay doc lap qua tsx/node
// thuong (xem docs/engineering-log.md 2026-09-10). Nghi ngo Turbopack tao ra
// 2 module instance khac nhau cho "@tiptap/core" giua dist da build san cua
// "@tiptap/html" (require CJS) va source ESM cua app - class Node/Extension
// tao ra tu 2 instance khac nhau khong tuong thich voi nhau du CUNG version.
// Ham nay tranh han rui ro do bang cach dung DUY NHAT 1 nguon "@tiptap/core"/
// "@tiptap/pm" (dung cung 1 import ma post-extensions.ts/Composer.tsx dang
// dung), tu dung happy-dom de gia lap document (schema Tiptap yeu cau
// DOMSerializer.serializeFragment() can 1 Document that, khong co san tren
// Node.js) - logic y het `@tiptap/html`'s `getHTMLFromFragment` ban server,
// chi khac nguon @tiptap/core.
export type TiptapHeading = { id: string; level: number; text: string };

function slugifyHeading(index: number, text: string): string {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9À-ỹ]+/gi, "-")
    .replace(/(^-+|-+$)/g, "");
  return `heading-${index}-${slug}`;
}

// Tra ca HTML LAN danh sach heading (id/level/text) - gan id vao THANG trong
// cay DOM (happy-dom) TRUOC KHI serialize ra string, dam bao id trong
// headings[] KHOP TUYET DOI voi id that trong HTML tra ve (1 vong duy nhat,
// khong the lech nhau nhu cach lam cu dung GithubSlugger rieng biet voi
// content rieng - xem lich su sua doi commit b302198). ArticleBody.tsx dung
// `html`, ArticleTableOfContents.tsx dung `headings` - CUNG 1 lan goi ham
// nay o page.tsx, khong goi rieng 2 lan.
export function renderTiptapHTML(
  doc: JSONContent,
  extensions: Extensions,
): { html: string; headings: TiptapHeading[] } {
  const schema = getSchema(extensions);
  const contentNode = ProseMirrorNode.fromJSON(schema, doc);

  const window = new Window({
    settings: {
      disableJavaScriptEvaluation: true,
      disableJavaScriptFileLoading: true,
      disableCSSFileLoading: true,
      disableIframePageLoading: true,
      disableComputedStyleRendering: true,
    },
  });

  try {
    const wrap = window.document.createElement("div");
    DOMSerializer.fromSchema(schema).serializeFragment(
      contentNode.content,
      { document: window.document as unknown as Document },
      wrap as unknown as HTMLElement,
    );

    const headings: TiptapHeading[] = [];
    const headingEls = wrap.querySelectorAll("h1, h2, h3, h4, h5, h6");
    headingEls.forEach((el, index) => {
      const text = (el.textContent ?? "").trim();
      const level = Number(el.tagName.slice(1));
      const id = slugifyHeading(index, text);
      el.setAttribute("id", id);
      headings.push({ id, level, text });
    });

    return { html: wrap.innerHTML, headings };
  } finally {
    window.happyDOM.abort();
    window.happyDOM.close();
  }
}
