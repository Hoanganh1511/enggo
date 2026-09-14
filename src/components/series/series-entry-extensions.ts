import type { Extensions } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import { Markdown } from "tiptap-markdown";

// Bo extension cho editor Entry cua Series - HAN CHE hon getPostExtensions()
// (Composer.tsx): CHI giu cac node/mark co the SERIALIZE DUOC ve markdown
// qua tiptap-markdown (heading/bold/italic/list/quote/code/link/anh/bang).
// KHONG dua cac node rieng cua Post vao (Callout/GlossaryHint/GoDeeper/
// TocBlock/CuratedList) - nhung node do luu snapshot vao attrs JSON, tiptap-markdown
// khong biet serialize chung ve markdown (se bi bo qua/loi), VA Entry van
// phai luu ra STRING markdown that (cot contentMarkdown, doc lai qua
// DocsMarkdown.tsx o trang doc - khac Post luu nguyen JSON Tiptap).
export function getSeriesEntryExtensions(): Extensions {
  return [
    StarterKit.configure({ link: false }),
    Link.configure({ openOnClick: false }),
    Image.configure({ inline: false, allowBase64: false }),
    TableKit.configure({ table: { resizable: true } }),
    Markdown.configure({ tightLists: true, linkify: false }),
  ];
}
