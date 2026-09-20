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
  "[&_h4]:mt-4 [&_h4]:mb-1.5 [&_h4]:text-[15.5px] [&_h4]:font-semibold " +
  "[&_p]:my-1 " +
  "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-2 [&_li_p]:my-0 " +
  "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 " +
  "[&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-border-strong [&_blockquote]:pl-4 " +
  "[&_hr]:my-8 [&_hr]:border-border " +
  "[&_code]:rounded [&_code]:bg-surface-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[13px] " +
  "[&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-[#0d1117] [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-[13px] [&_pre]:text-[#e6edf3] " +
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[#e6edf3] " +
  "[&_img]:my-4 [&_img]:rounded-xl [&_img]:border [&_img]:border-border [&_img]:max-w-full " +
  // border-separate + border-spacing-0 (thay vi border-collapse) - loi
  // hien thi that su nguoi dung bao ("Xử lý clean phần border radius của
  // table đi, lỗi", kem anh 1 canh bi "cong" bat thuong o giua bang): voi
  // border-collapse, 2 canh border ke nhau (vd border-phai cua o A + border-
  // trai cua o B) GOP LAM MOT theo thuat toan rieng cua trinh duyet, thuat
  // toan do XUNG DOT voi border-radius+overflow-hidden tren <table> (radius
  // chi cat duoc o NGOAI CUNG do trinh duyet ve, khong "biet" ve cac canh
  // collapse ben trong) - sinh ra 1 mau border THUA/cong queo tai giao diem
  // giua cac o, ro nhat o hang/cot gan goc bo tron. border-separate coi moi
  // border la 1 duong RIENG BIET (khong gop), khong con xung dot voi bo tron
  // nua - doi lai phai TU quan ly khong cho border bi "gap doi" o giua 2 o
  // (border-phai cua o TRUOC + border-trai cua o SAU): chi ke border-duoi/
  // border-phai cho MOI o (khong con border-trai/border-tren rieng), de
  // CHINH border cua <table> (border-border ben duoi) dam nhiem canh
  // tren/trai NGOAI CUNG, roi bo border-phai cua o CUOI moi hang + border-
  // duoi cua hang CUOI cung (da trung voi border cua <table>, xem 2 dong
  // duoi) - ra dung 1 luoi ke, khong con o nao ke 2 lan.
  "[&_table]:my-5 [&_table]:w-full [&_table]:overflow-hidden [&_table]:rounded-lg [&_table]:border [&_table]:border-border [&_table]:border-separate [&_table]:border-spacing-0 [&_table]:text-[14px] " +
  "[&_th]:border-r [&_th]:border-b [&_th]:border-border [&_th]:bg-surface-muted [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold " +
  "[&_td]:border-r [&_td]:border-b [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:align-top " +
  "[&_tr>*:last-child]:border-r-0 [&_tbody_tr:last-child>*]:border-b-0 " +
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
  // "Accordion với header dạng layout" - xem comment chi tiet trong POST_PROSE_CLASS.
  "[&_.accordion-summary-media]:flex [&_.accordion-summary-media]:min-w-0 [&_.accordion-summary-media]:flex-1 [&_.accordion-summary-media]:items-center [&_.accordion-summary-media]:gap-3 " +
  "[&_.accordion-summary-icon]:size-10 [&_.accordion-summary-icon]:shrink-0 [&_.accordion-summary-icon]:rounded-lg [&_.accordion-summary-icon]:object-cover " +
  "[&_.accordion-summary-icon-empty]:bg-surface-muted " +
  "[&_.accordion-summary-text]:min-w-0 [&_.accordion-summary-text]:flex-1 " +
  "[&_.accordion-summary-title]:block [&_.accordion-summary-title]:truncate " +
  "[&_.accordion-summary-desc]:mt-0.5 [&_.accordion-summary-desc]:truncate [&_.accordion-summary-desc]:text-[13px] [&_.accordion-summary-desc]:font-normal [&_.accordion-summary-desc]:text-ink-muted " +
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
  "[&_.flow-diagram-note-branch]:mt-1 [&_.flow-diagram-note-branch]:mb-1 [&_.flow-diagram-note-branch]:max-w-[10rem] [&_.flow-diagram-note-branch]:text-center [&_.flow-diagram-note-branch]:text-[11px] [&_.flow-diagram-note-branch]:text-ink-faint [&_.flow-diagram-note-branch]:italic " +
  // Mau NEN (BackgroundColor) - xem comment chi tiet trong POST_PROSE_CLASS.
  "[&_span[style*=background-color]]:box-decoration-clone [&_span[style*=background-color]]:px-1 [&_span[style*=background-color]]:py-0.5 " +
  // Grid - trang doc cong khai render tu HTML tho (Grid.addStorage() da ghi
  // SAN grid-template-columns lam inline style ngay trong chuoi HTML, xem
  // post-extensions.ts) - CHI can display:grid qua class o day, KHONG can
  // xu ly lop "react-renderer"/"data-node-view-content-react" nhu
  // POST_PROSE_CLASS (do la dac thu rieng cua NodeView luc SOAN, khong ton
  // tai trong HTML tinh o day).
  "[&_.grid-cells]:my-4 [&_.grid-cells]:grid [&_.grid-cells]:gap-3 " +
  // [2026-09-20 redesign] xem comment chi tiet trong POST_PROSE_CLASS.
  "[&_.grid-cell]:overflow-hidden [&_.grid-cell]:rounded-lg [&_.grid-cell]:border [&_.grid-cell]:border-border [&_.grid-cell]:bg-surface [&_.grid-cell]:shadow-sm [&_.grid-cell]:transition-all [&_.grid-cell]:duration-150 [&_.grid-cell]:hover:-translate-y-0.5 [&_.grid-cell]:hover:shadow-md " +
  "[&_.grid-cell-head]:flex [&_.grid-cell-head]:h-11 [&_.grid-cell-head]:items-center [&_.grid-cell-head]:gap-2 [&_.grid-cell-head]:border-b [&_.grid-cell-head]:border-border [&_.grid-cell-head]:bg-surface-muted/60 [&_.grid-cell-head]:px-3 " +
  "[&_.grid-cell-badge]:inline-flex [&_.grid-cell-badge]:items-center [&_.grid-cell-badge]:gap-1.5 [&_.grid-cell-badge]:rounded-full [&_.grid-cell-badge]:border [&_.grid-cell-badge]:border-border [&_.grid-cell-badge]:bg-surface [&_.grid-cell-badge]:px-2 [&_.grid-cell-badge]:py-1 " +
  "[&_.grid-cell-badge-dot]:inline-block [&_.grid-cell-badge-dot]:size-2 [&_.grid-cell-badge-dot]:shrink-0 [&_.grid-cell-badge-dot]:rounded-full " +
  "[&_.grid-cell-badge-label]:text-[11px] [&_.grid-cell-badge-label]:font-medium [&_.grid-cell-badge-label]:whitespace-nowrap [&_.grid-cell-badge-label]:text-ink " +
  "[&_.grid-cell-step]:flex [&_.grid-cell-step]:size-7 [&_.grid-cell-step]:shrink-0 [&_.grid-cell-step]:items-center [&_.grid-cell-step]:justify-center [&_.grid-cell-step]:rounded-full [&_.grid-cell-step]:bg-primary [&_.grid-cell-step]:font-mono [&_.grid-cell-step]:text-[11px] [&_.grid-cell-step]:font-bold [&_.grid-cell-step]:text-white " +
  "[&_.grid-cell-body]:p-4 [&_.grid-cell-body]:text-[14px] [&_.grid-cell-body]:leading-relaxed [&_.grid-cell-body_p]:my-1 [&_.grid-cell-body_p:first-child]:mt-0 [&_.grid-cell-body_p:last-child]:mb-0 " +
  // CardGrid + SplitBlock - xem comment chi tiet trong POST_PROSE_CLASS.
  // "The kien thuc/dich vu" generic (redesign lan 2) - xem comment chi tiet
  // trong POST_PROSE_CLASS.
  "[&_[data-card-grid]]:my-4 [&_[data-card-grid]]:grid [&_[data-card-grid]]:gap-3 [&_[data-card-grid]]:[grid-template-columns:repeat(auto-fit,minmax(240px,1fr))] " +
  "[&_.card-grid-item]:relative [&_.card-grid-item]:flex [&_.card-grid-item]:flex-col [&_.card-grid-item]:overflow-hidden [&_.card-grid-item]:rounded-lg [&_.card-grid-item]:border [&_.card-grid-item]:border-border [&_.card-grid-item]:bg-surface [&_.card-grid-item]:p-4 [&_.card-grid-item]:no-underline [&_.card-grid-item]:shadow-xs " +
  "[&_a.card-grid-item]:cursor-pointer [&_.card-grid-item]:transition-shadow [&_.card-grid-item]:duration-200 [&_.card-grid-item:hover]:[box-shadow:0_0_0_1px_color-mix(in_srgb,var(--primary)_30%,transparent),0_16px_32px_-8px_color-mix(in_srgb,var(--primary)_45%,transparent)] " +
  "[&_.card-grid-item-glow]:pointer-events-none [&_.card-grid-item-glow]:absolute [&_.card-grid-item-glow]:-top-8 [&_.card-grid-item-glow]:-right-8 [&_.card-grid-item-glow]:size-32 [&_.card-grid-item-glow]:rounded-full [&_.card-grid-item-glow]:opacity-[0.06] [&_.card-grid-item-glow]:[background:radial-gradient(circle,var(--primary)_0%,transparent_70%)] " +
  "[&_.card-grid-item-topbar]:relative [&_.card-grid-item-topbar]:z-10 [&_.card-grid-item-topbar]:mb-2.5 [&_.card-grid-item-topbar]:flex [&_.card-grid-item-topbar]:items-center [&_.card-grid-item-topbar]:justify-between " +
  "[&_.card-grid-item-dot]:size-2.5 [&_.card-grid-item-dot]:shrink-0 [&_.card-grid-item-dot]:rounded-full " +
  "[&_.card-grid-item-utility]:ml-auto [&_.card-grid-item-utility]:text-[14px] [&_.card-grid-item-utility]:leading-none [&_.card-grid-item-utility]:text-ink-faint " +
  "[&_.card-grid-item-head]:relative [&_.card-grid-item-head]:z-10 [&_.card-grid-item-head]:flex [&_.card-grid-item-head]:items-center [&_.card-grid-item-head]:gap-3 " +
  "[&_.card-grid-item-icon]:flex [&_.card-grid-item-icon]:size-13 [&_.card-grid-item-icon]:shrink-0 [&_.card-grid-item-icon]:items-center [&_.card-grid-item-icon]:justify-center [&_.card-grid-item-icon]:rounded-lg [&_.card-grid-item-icon]:text-[22px] [&_.card-grid-item-icon]:font-bold [&_.card-grid-item-icon]:text-white " +
  "[&_.card-grid-item-headtext]:min-w-0 [&_.card-grid-item-headtext]:flex-1 " +
  "[&_.card-grid-item-title]:block [&_.card-grid-item-title]:truncate [&_.card-grid-item-title]:text-[16px] [&_.card-grid-item-title]:font-bold [&_.card-grid-item-title]:leading-tight [&_.card-grid-item-title]:text-ink " +
  "[&_.card-grid-item-subtitle]:mt-0.5 [&_.card-grid-item-subtitle]:block [&_.card-grid-item-subtitle]:truncate [&_.card-grid-item-subtitle]:text-[12px] [&_.card-grid-item-subtitle]:font-medium [&_.card-grid-item-subtitle]:text-ink-faint " +
  "[&_.card-grid-item-tags]:relative [&_.card-grid-item-tags]:z-10 [&_.card-grid-item-tags]:mt-3 [&_.card-grid-item-tags]:flex [&_.card-grid-item-tags]:flex-wrap [&_.card-grid-item-tags]:gap-1.5 " +
  "[&_.card-grid-item-tag]:rounded-full [&_.card-grid-item-tag]:bg-surface-muted [&_.card-grid-item-tag]:px-2.5 [&_.card-grid-item-tag]:py-1 [&_.card-grid-item-tag]:text-[11px] [&_.card-grid-item-tag]:font-medium [&_.card-grid-item-tag]:text-ink-muted " +
  "[&_.card-grid-item-desc]:relative [&_.card-grid-item-desc]:z-10 [&_.card-grid-item-desc]:mt-3 [&_.card-grid-item-desc]:text-[13.5px] [&_.card-grid-item-desc]:leading-relaxed [&_.card-grid-item-desc]:text-ink-muted " +
  "[&_.card-grid-item-divider]:relative [&_.card-grid-item-divider]:z-10 [&_.card-grid-item-divider]:mt-3 [&_.card-grid-item-divider]:border-t [&_.card-grid-item-divider]:border-border " +
  "[&_.card-grid-item-keyinfo]:relative [&_.card-grid-item-keyinfo]:z-10 [&_.card-grid-item-keyinfo]:mt-3 [&_.card-grid-item-keyinfo]:flex [&_.card-grid-item-keyinfo]:flex-col [&_.card-grid-item-keyinfo]:gap-1.5 " +
  "[&_.card-grid-item-keyinfo-row]:flex [&_.card-grid-item-keyinfo-row]:items-baseline [&_.card-grid-item-keyinfo-row]:justify-between [&_.card-grid-item-keyinfo-row]:gap-3 [&_.card-grid-item-keyinfo-row]:text-[12.5px] " +
  "[&_.card-grid-item-keyinfo-label]:shrink-0 [&_.card-grid-item-keyinfo-label]:text-ink-faint " +
  "[&_.card-grid-item-keyinfo-value]:min-w-0 [&_.card-grid-item-keyinfo-value]:truncate [&_.card-grid-item-keyinfo-value]:text-right [&_.card-grid-item-keyinfo-value]:font-medium [&_.card-grid-item-keyinfo-value]:text-ink " +
  "[&_.card-grid-item-footer]:relative [&_.card-grid-item-footer]:z-10 [&_.card-grid-item-footer]:mt-auto [&_.card-grid-item-footer]:flex [&_.card-grid-item-footer]:items-center [&_.card-grid-item-footer]:justify-between [&_.card-grid-item-footer]:gap-3 [&_.card-grid-item-footer]:border-t [&_.card-grid-item-footer]:border-border [&_.card-grid-item-footer]:pt-3 " +
  "[&_.card-grid-item-link]:inline-flex [&_.card-grid-item-link]:items-center [&_.card-grid-item-link]:text-[13px] [&_.card-grid-item-link]:font-semibold [&_.card-grid-item-link]:text-primary " +
  "[&_.card-grid-item-link-label]:inline-block [&_.card-grid-item-link-label]:max-w-0 [&_.card-grid-item-link-label]:-translate-x-2 [&_.card-grid-item-link-label]:overflow-hidden [&_.card-grid-item-link-label]:whitespace-nowrap [&_.card-grid-item-link-label]:opacity-0 [&_.card-grid-item-link-label]:transition-all [&_.card-grid-item-link-label]:duration-200 [&_.card-grid-item-link-label]:ease-out " +
  "[&_.card-grid-item:hover_.card-grid-item-link-label]:mr-1 [&_.card-grid-item:hover_.card-grid-item-link-label]:max-w-40 [&_.card-grid-item:hover_.card-grid-item-link-label]:translate-x-0 [&_.card-grid-item:hover_.card-grid-item-link-label]:opacity-100 " +
  "[&_.card-grid-item-link-arrow]:inline-block [&_.card-grid-item-link-arrow]:transition-transform [&_.card-grid-item-link-arrow]:duration-200 [&_.card-grid-item-link-arrow]:ease-out " +
  "[&_.card-grid-item:hover_.card-grid-item-link-arrow]:translate-x-0.5 " +
  "[&_.card-grid-item-footnote]:truncate [&_.card-grid-item-footnote]:text-[11.5px] [&_.card-grid-item-footnote]:text-ink-faint " +
  "[&_.split-block]:my-4 [&_.split-block]:flex [&_.split-block]:flex-col [&_.split-block]:gap-6 sm:[&_.split-block]:flex-row " +
  "[&_.split-column]:min-w-0 [&_.split-column]:flex-1 [&_.split-column_p:first-child]:mt-0 [&_.split-column_p:last-child]:mb-0 " +
  "[&_.split-column:first-child]:sm:flex-[0_0_32%] " +
  // ProfileBlock - xem comment chi tiet trong POST_PROSE_CLASS.
  "[&_.profile-block-head]:mb-3 [&_.profile-block-head]:flex [&_.profile-block-head]:items-center [&_.profile-block-head]:gap-3 " +
  "[&_.profile-block-avatar]:size-13 [&_.profile-block-avatar]:shrink-0 [&_.profile-block-avatar]:rounded-lg [&_.profile-block-avatar]:border [&_.profile-block-avatar]:border-border [&_.profile-block-avatar]:object-cover " +
  "[&_.profile-block-avatar-empty]:bg-surface-muted " +
  "[&_.profile-block-name]:text-[17px] [&_.profile-block-name]:font-bold [&_.profile-block-name]:text-ink " +
  "[&_.profile-block-body_p:first-child]:mt-0 [&_.profile-block-body_p:last-child]:mb-0";
