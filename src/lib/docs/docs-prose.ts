// Class prose CHO RIENG trang /docs - COPY tu POST_PROSE_CLASS
// (components/compose/post-extensions.ts) thay vi import truc tiep, vi
// file do import ca cay extension Tiptap (`Node` tu @tiptap/react...) o cap
// module - keo theo no vao 1 Server Component (DocsMarkdown.tsx) lam build
// loi ("Node.create is not a function") luc Next.js "collect page data".
// 2 noi cung style cho DUNG 1 bo the HTML chuan (h1/h2/p/ul/code/pre...) nen
// hop ly de trung noi dung - chi khac o CHO import, khong khac o Y NGHIA.
export const DOCS_PROSE_CLASS =
  // font-content: noi dung tai lieu doc lau dung Be Vietnam Pro thay --font-sans
  // mac dinh (UI/dieu huong) - [&_code]/[&_pre] ben duoi van font-mono rieng
  // (quy uoc code luon monospace, khong lien quan rule content/UI nay).
  "font-content max-w-none text-[15px] leading-[1.75] text-ink focus:outline-none " +
  "[&_h1]:mt-8 [&_h1]:mb-3 [&_h1]:text-[30px] [&_h1]:font-bold [&_h1]:leading-tight [&_h1]:tracking-tight " +
  "[&_h2]:mt-7 [&_h2]:mb-2.5 [&_h2]:text-[23px] [&_h2]:font-bold [&_h2]:leading-snug " +
  "[&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-[18px] [&_h3]:font-semibold " +
  "[&_p]:my-1 " +
  "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-2 [&_li_p]:my-0 " +
  "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 " +
  "[&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-border-strong [&_blockquote]:pl-4 [&_blockquote]:text-ink-muted [&_blockquote]:italic " +
  "[&_hr]:my-8 [&_hr]:border-border " +
  "[&_code]:rounded [&_code]:bg-surface-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[13px] " +
  "[&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-[#0d1117] [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-[13px] [&_pre]:text-[#e6edf3] " +
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[#e6edf3] " +
  "[&_img]:my-4 [&_img]:rounded-xl [&_img]:border [&_img]:border-border [&_img]:max-w-full " +
  "[&_table]:my-5 [&_table]:w-full [&_table]:border-collapse [&_table]:overflow-hidden [&_table]:rounded-lg [&_table]:text-[14px] " +
  "[&_th]:border [&_th]:border-border [&_th]:bg-surface-muted [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold " +
  "[&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:align-top " +
  // "TOC 4-box cau hoi" (QuestionPicker, xem post-extensions.ts) - COPY tu
  // POST_PROSE_CLASS y het (cung ly do khong import truc tiep, xem comment
  // dau file). QuestionPicker.addStorage() ghi RA HTML THAT (khac
  // Callout/GoDeeper/TocBlock khac chi xuong cap text) nen CAN bo CSS nay o
  // day de <details>/<summary> hien dung grid/collapse khi doc qua
  // DocsMarkdown.tsx (rehype-raw).
  "[&_div[data-question-picker]]:my-5 [&_div[data-question-picker]]:grid [&_div[data-question-picker]]:grid-cols-1 [&_div[data-question-picker]]:gap-2 sm:[&_div[data-question-picker]]:grid-cols-2 " +
  "[&_.question-picker-item]:rounded-xl [&_.question-picker-item]:border [&_.question-picker-item]:border-border [&_.question-picker-item]:px-3.5 " +
  "[&_.question-picker-item[open]]:bg-surface-muted " +
  "[&_.question-picker-summary]:flex [&_.question-picker-summary]:cursor-pointer [&_.question-picker-summary]:list-none [&_.question-picker-summary]:items-center [&_.question-picker-summary]:gap-2.5 [&_.question-picker-summary]:py-3 [&_.question-picker-summary]:select-none " +
  "[&_.question-picker-summary::-webkit-details-marker]:hidden [&_.question-picker-summary::marker]:content-none " +
  "[&_.question-picker-index]:font-mono [&_.question-picker-index]:text-[12px] [&_.question-picker-index]:text-ink-faint " +
  "[&_.question-picker-question]:flex-1 [&_.question-picker-question]:text-[14.5px] [&_.question-picker-question]:font-semibold [&_.question-picker-question]:text-ink " +
  "[&_.question-picker-chevron]:shrink-0 [&_.question-picker-chevron]:text-ink-faint [&_.question-picker-chevron]:transition-transform [&_.question-picker-chevron]:duration-150 " +
  "[&_.question-picker-item[open]_.question-picker-chevron]:rotate-180 " +
  "[&_.question-picker-description]:mb-3.5 [&_.question-picker-description]:text-[13.5px] [&_.question-picker-description]:text-ink-muted " +
  // Accordion + Accordion Geographical (StatAccordion) - COPY tu
  // POST_PROSE_CLASS y het (cung ly do khong import truc tiep, xem comment
  // dau file). [2026-09-16] Truoc do THIEU HAN 2 khoi CSS nay o day - Accordion/
  // StatAccordion.addStorage() ghi ra HTML THAT (<details>/<summary>, giong
  // QuestionPicker o tren) nen CAN co CSS tuong ung khi doc qua
  // DocsMarkdown.tsx (trang Entry cong khai LAN "Live preview" trong
  // SeriesEntryForm.tsx deu dung DocsMarkdown, khong dung POST_PROSE_CLASS) -
  // thieu khien ca 2 loai accordion hien FLAT, khong khung/khong dam mau,
  // khong phan biet duoc cap long nhau (nguoi dung bao "vẫn thô kệch một
  // loạt thẳng hàng"). Giu 2 file dong bo THU CONG moi khi sua 1 trong 2.
  "[&_.accordion-block]:my-4 [&_.accordion-block]:overflow-hidden [&_.accordion-block]:rounded-xl [&_.accordion-block]:border [&_.accordion-block]:border-border [&_.accordion-block]:bg-surface " +
  "[&_.accordion-body_.accordion-block]:my-3 [&_.accordion-body_.accordion-block]:rounded-lg [&_.accordion-body_.accordion-block]:bg-surface-muted " +
  "[&_.accordion-summary]:flex [&_.accordion-summary]:cursor-pointer [&_.accordion-summary]:list-none [&_.accordion-summary]:items-center [&_.accordion-summary]:gap-2 [&_.accordion-summary]:px-3.5 [&_.accordion-summary]:py-2.5 [&_.accordion-summary]:text-[14.5px] [&_.accordion-summary]:font-semibold [&_.accordion-summary]:text-ink [&_.accordion-summary]:select-none " +
  "[&_.accordion-summary::-webkit-details-marker]:hidden [&_.accordion-summary::marker]:content-none " +
  "[&_.accordion-summary]:before:content-['▾'] [&_.accordion-summary]:before:inline-block [&_.accordion-summary]:before:text-ink-faint [&_.accordion-summary]:before:transition-transform [&_.accordion-summary]:before:duration-150 " +
  "[&_.accordion-block:not([open])_.accordion-summary]:before:-rotate-90 " +
  "[&_.accordion-body]:border-t [&_.accordion-body]:border-border [&_.accordion-body]:px-3.5 [&_.accordion-body]:py-3 [&_.accordion-body_p]:my-1 " +
  // Mau nen co dinh #F3F3F7, khong border (yeu cau nguoi dung: "accordion
  // geographic không cần border đâu, có màu nền là được rồi" - xem comment
  // chi tiet trong POST_PROSE_CLASS).
  "[&_.stat-accordion]:my-4 [&_.stat-accordion]:overflow-hidden [&_.stat-accordion]:rounded-xl [&_.stat-accordion]:bg-[#F3F3F7] " +
  "[&_.accordion-body_.stat-accordion]:my-3 [&_.accordion-body_.stat-accordion]:rounded-lg " +
  "[&_.stat-accordion-summary]:flex [&_.stat-accordion-summary]:cursor-pointer [&_.stat-accordion-summary]:list-none [&_.stat-accordion-summary]:items-center [&_.stat-accordion-summary]:gap-2.5 [&_.stat-accordion-summary]:px-3.5 [&_.stat-accordion-summary]:py-2.5 [&_.stat-accordion-summary]:select-none " +
  "[&_.stat-accordion-summary::-webkit-details-marker]:hidden [&_.stat-accordion-summary::marker]:content-none " +
  // min-w-0 - responsive cho tieu de dai canh badge so luong tren man hinh
  // hep (xem comment giai thich chi tiet trong POST_PROSE_CLASS).
  "[&_.stat-accordion-title]:min-w-0 [&_.stat-accordion-title]:flex-1 [&_.stat-accordion-title]:text-[14.5px] [&_.stat-accordion-title]:font-semibold [&_.stat-accordion-title]:text-ink " +
  // Nen trang, chu den 80% opacity, size nho hon tieu de - yeu cau nguoi
  // dung: "Cái số lượng trong accordion này để nền trắng, text đen 80%,
  // size nhỏ hơn 2px nhé".
  "[&_.stat-accordion-badge]:rounded-md [&_.stat-accordion-badge]:bg-white [&_.stat-accordion-badge]:px-2 [&_.stat-accordion-badge]:py-1 [&_.stat-accordion-badge]:text-[10.5px] [&_.stat-accordion-badge]:font-semibold [&_.stat-accordion-badge]:text-black/80 " +
  "[&_.stat-accordion-summary]:after:ml-1 [&_.stat-accordion-summary]:after:flex [&_.stat-accordion-summary]:after:size-5 [&_.stat-accordion-summary]:after:shrink-0 [&_.stat-accordion-summary]:after:items-center [&_.stat-accordion-summary]:after:justify-center [&_.stat-accordion-summary]:after:text-[15px] [&_.stat-accordion-summary]:after:leading-none [&_.stat-accordion-summary]:after:text-ink-faint [&_.stat-accordion-summary]:after:content-['+'] " +
  "[&_.stat-accordion[open]_.stat-accordion-summary]:after:content-['−'] " +
  "[&_.stat-accordion-body]:px-3.5 [&_.stat-accordion-body]:py-3 " +
  "[&_.stat-accordion-description]:mb-3 [&_.stat-accordion-description]:text-[13.5px] [&_.stat-accordion-description]:text-ink-muted " +
  "[&_.stat-accordion-list]:grid [&_.stat-accordion-list]:max-h-64 [&_.stat-accordion-list]:grid-cols-1 [&_.stat-accordion-list]:gap-x-3 [&_.stat-accordion-list]:gap-y-2 [&_.stat-accordion-list]:overflow-y-auto sm:[&_.stat-accordion-list]:grid-cols-2 " +
  // Moi dong 1 "the" nen trang rieng (yeu cau nguoi dung: "Mỗi cái cho nó
  // nền trắng, padding, radius như ảnh 2").
  "[&_.stat-accordion-item]:flex [&_.stat-accordion-item]:items-center [&_.stat-accordion-item]:gap-2 [&_.stat-accordion-item]:rounded-lg [&_.stat-accordion-item]:bg-surface [&_.stat-accordion-item]:px-3 [&_.stat-accordion-item]:py-2.5 [&_.stat-accordion-item-text]:min-w-0 [&_.stat-accordion-item-text]:flex-1 [&_.stat-accordion-item-text]:text-[13.5px] [&_.stat-accordion-item-text]:text-ink " +
  // Doi hieu ung hover - yeu cau nguoi dung: "Đổi hiệu ứng hover đi nhé"
  // (xem comment chi tiet trong POST_PROSE_CLASS).
  "[&_.stat-accordion-item-clickable]:cursor-pointer [&_.stat-accordion-item-clickable]:outline-none [&_.stat-accordion-item-clickable]:transition-colors [&_.stat-accordion-item-clickable]:duration-150 [&_.stat-accordion-item-clickable]:hover:bg-primary/8 " +
  "[&_.stat-accordion-item-clickable_.stat-accordion-item-text]:transition-colors [&_.stat-accordion-item-clickable_.stat-accordion-item-text]:duration-150 [&_.stat-accordion-item-clickable:hover_.stat-accordion-item-text]:text-primary " +
  "[&_.stat-accordion-dot]:inline-block [&_.stat-accordion-dot]:size-2 [&_.stat-accordion-dot]:shrink-0 [&_.stat-accordion-dot]:rounded-full " +
  "[&_.stat-accordion-legend]:mt-3 [&_.stat-accordion-legend]:flex [&_.stat-accordion-legend]:flex-col [&_.stat-accordion-legend]:gap-1.5 [&_.stat-accordion-legend]:border-t [&_.stat-accordion-legend]:border-border [&_.stat-accordion-legend]:pt-3 " +
  "[&_.stat-accordion-legend-item]:flex [&_.stat-accordion-legend-item]:items-center [&_.stat-accordion-legend-item]:gap-2 [&_.stat-accordion-legend-item]:text-[12.5px] [&_.stat-accordion-legend-item]:text-ink-faint " +
  // "Sơ đồ luồng" (FlowDiagram) - xem comment chi tiet trong POST_PROSE_CLASS.
  "[&_.flow-diagram]:mx-auto [&_.flow-diagram]:my-6 [&_.flow-diagram]:flex [&_.flow-diagram]:w-full [&_.flow-diagram]:max-w-2xl [&_.flow-diagram]:flex-col [&_.flow-diagram]:items-center " +
  "[&_.flow-diagram-node]:flex [&_.flow-diagram-node]:w-full [&_.flow-diagram-node]:flex-col [&_.flow-diagram-node]:items-center " +
  "[&_.flow-diagram-step]:w-full [&_.flow-diagram-step]:max-w-sm [&_.flow-diagram-step]:rounded-lg [&_.flow-diagram-step]:border [&_.flow-diagram-step]:border-border [&_.flow-diagram-step]:bg-surface [&_.flow-diagram-step]:px-4 [&_.flow-diagram-step]:py-2.5 [&_.flow-diagram-step]:text-center [&_.flow-diagram-step]:text-[14px] [&_.flow-diagram-step]:font-semibold [&_.flow-diagram-step]:text-ink " +
  "[&_.flow-diagram-arrow]:relative [&_.flow-diagram-arrow]:h-10 [&_.flow-diagram-arrow]:w-full [&_.flow-diagram-arrow]:max-w-sm " +
  "[&_.flow-diagram-arrow]:before:absolute [&_.flow-diagram-arrow]:before:top-0 [&_.flow-diagram-arrow]:before:bottom-0 [&_.flow-diagram-arrow]:before:left-1/2 [&_.flow-diagram-arrow]:before:w-0.5 [&_.flow-diagram-arrow]:before:-translate-x-1/2 [&_.flow-diagram-arrow]:before:bg-border [&_.flow-diagram-arrow]:before:content-[''] " +
  "[&_.flow-diagram-arrow]:after:absolute [&_.flow-diagram-arrow]:after:bottom-0 [&_.flow-diagram-arrow]:after:left-1/2 [&_.flow-diagram-arrow]:after:-translate-x-1/2 [&_.flow-diagram-arrow]:after:border-x-[5px] [&_.flow-diagram-arrow]:after:border-t-[7px] [&_.flow-diagram-arrow]:after:border-x-transparent [&_.flow-diagram-arrow]:after:border-t-ink-faint [&_.flow-diagram-arrow]:after:content-[''] " +
  "[&_.flow-diagram-note]:absolute [&_.flow-diagram-note]:top-1/2 [&_.flow-diagram-note]:-translate-y-1/2 [&_.flow-diagram-note]:text-[12px] [&_.flow-diagram-note]:text-ink-faint [&_.flow-diagram-note]:italic " +
  "[&_.flow-diagram-note]:left-[calc(50%+16px)] [&_.flow-diagram-note]:w-48 " +
  "[&_.flow-diagram-trunk]:h-4 [&_.flow-diagram-trunk]:w-0.5 [&_.flow-diagram-trunk]:bg-border " +
  "[&_.flow-diagram-branches]:relative [&_.flow-diagram-branches]:flex [&_.flow-diagram-branches]:w-full [&_.flow-diagram-branches]:items-start [&_.flow-diagram-branches]:justify-center [&_.flow-diagram-branches]:gap-8 " +
  "[&_.flow-diagram-branch]:relative [&_.flow-diagram-branch]:flex [&_.flow-diagram-branch]:min-w-[110px] [&_.flow-diagram-branch]:flex-1 [&_.flow-diagram-branch]:flex-col [&_.flow-diagram-branch]:items-center " +
  "[&_.flow-diagram-branch:not(:first-child)]:before:absolute [&_.flow-diagram-branch:not(:first-child)]:before:top-0 [&_.flow-diagram-branch:not(:first-child)]:before:right-1/2 [&_.flow-diagram-branch:not(:first-child)]:before:h-0.5 [&_.flow-diagram-branch:not(:first-child)]:before:w-[calc(50%+16px)] [&_.flow-diagram-branch:not(:first-child)]:before:bg-border [&_.flow-diagram-branch:not(:first-child)]:before:content-[''] " +
  "[&_.flow-diagram-branch:not(:last-child)]:after:absolute [&_.flow-diagram-branch:not(:last-child)]:after:top-0 [&_.flow-diagram-branch:not(:last-child)]:after:left-1/2 [&_.flow-diagram-branch:not(:last-child)]:after:h-0.5 [&_.flow-diagram-branch:not(:last-child)]:after:w-[calc(50%+16px)] [&_.flow-diagram-branch:not(:last-child)]:after:bg-border [&_.flow-diagram-branch:not(:last-child)]:after:content-[''] " +
  "[&_.flow-diagram-branch-stem]:relative [&_.flow-diagram-branch-stem]:h-4 [&_.flow-diagram-branch-stem]:w-0.5 [&_.flow-diagram-branch-stem]:bg-border " +
  "[&_.flow-diagram-branch-stem]:after:absolute [&_.flow-diagram-branch-stem]:after:bottom-0 [&_.flow-diagram-branch-stem]:after:left-1/2 [&_.flow-diagram-branch-stem]:after:-translate-x-1/2 [&_.flow-diagram-branch-stem]:after:border-x-[5px] [&_.flow-diagram-branch-stem]:after:border-t-[7px] [&_.flow-diagram-branch-stem]:after:border-x-transparent [&_.flow-diagram-branch-stem]:after:border-t-ink-faint [&_.flow-diagram-branch-stem]:after:content-[''] " +
  "[&_.flow-diagram-note-branch]:mt-1 [&_.flow-diagram-note-branch]:mb-1 [&_.flow-diagram-note-branch]:max-w-[10rem] [&_.flow-diagram-note-branch]:text-center [&_.flow-diagram-note-branch]:text-[11px] [&_.flow-diagram-note-branch]:text-ink-faint [&_.flow-diagram-note-branch]:italic";
