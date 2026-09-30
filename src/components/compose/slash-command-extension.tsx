import { Extension } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";
import Suggestion from "@tiptap/suggestion";
import { getSlashCommandItems, filterSlashCommandItems, type SlashCommandItem } from "./slash-command-items";
import { SlashCommandMenu, type SlashCommandMenuHandle } from "./SlashCommandMenu";

// "/" slash command (kieu Notion) - yeu cau nguoi dung: "Bổ sung tính năng
// gõ command "/...." ra các tính năng để insert vào trong editor giống kiểu
// notion". Dung `@tiptap/suggestion` (utility CHINH THUC cua Tiptap, cung
// nen tang cac extension nhu Mention/Emoji dung) thay vi tu viet 1 plugin
// theo doi ky tu "/" tu dau - tranh lai banh xe cac phan tinh vi (theo doi vi
// tri go, tu dong dong khi mat khop, dinh vi popup bam theo con tro qua
// floating-ui...).
//
// Kien truc:
// - `items()` loc danh sach lenh tinh (slash-command-items.tsx) theo query
//   go sau dau "/".
// - `command()` (cap Suggestion, chay SAU khi 1 lenh duoc CHON) goi thang
//   `item.run(editor, range)` - MOI item tu chiu trach nhiem xoa "/query"
//   (deleteRange) VA chen noi dung that cua no.
// - `render()` dung ReactRenderer de "mount" component SlashCommandMenu.tsx
//   (dropdown UI) vao 1 phan tu noi qua `props.mount()` (helper co san cua
//   Suggestion, tu lo dinh vi bam theo con tro + tu dong cap nhat khi cuon/
//   resize, xem SuggestionProps.mount trong node_modules/.pnpm/@tiptap+suggestion).
export const SlashCommand = Extension.create({
  name: "slashCommand",

  addProseMirrorPlugins() {
    return [
      Suggestion<SlashCommandItem>({
        editor: this.editor,
        char: "/",
        items: ({ query }) => filterSlashCommandItems(getSlashCommandItems(), query),
        command: ({ editor, range, props }) => {
          props.run(editor, range);
        },
        render: () => {
          let component: ReactRenderer<SlashCommandMenuHandle> | null = null;
          let unmount: (() => void) | null = null;
          let closeTimeout: ReturnType<typeof setTimeout> | null = null;

          // Dong CO HIEU UNG (fade+scale, xem SlashCommandMenu.tsx) thay vi
          // go DOT NGOT khoi DOM - `hide()` chi doi trang thai noi bo (kich
          // hoat AnimatePresence's exit), doi het 160ms (~ dai hon 150ms
          // transition duration 1 chut cho chac) roi moi THAT SU go phan tu
          // noi (unmount()) + huy component (destroy()).
          function closeWithAnimation() {
            if (closeTimeout) return;
            component?.ref?.hide();
            closeTimeout = setTimeout(() => {
              unmount?.();
              unmount = null;
              component?.destroy();
              component = null;
              closeTimeout = null;
            }, 160);
          }

          return {
            onStart: (props) => {
              component = new ReactRenderer(SlashCommandMenu, {
                props: {
                  items: props.items,
                  command: (item: SlashCommandItem) => props.command(item),
                },
                editor: props.editor,
              });
              // [2026-09-30] z-index THANG len chinh element noi cua
              // ReactRenderer - bug nguoi dung bao: "hiện lên nhưng bị chìm
              // xuống dưới các element khác". Nguyen nhan: className "z-50"
              // truoc do dat tren <motion.div> BEN TRONG cay React
              // (SlashCommandMenu.tsx) - z-index CHI co tac dung tren phan tu
              // DA DUOC DINH VI (position khac static), nhung <motion.div> do
              // van la position:static mac dinh (khong he duoc floating-ui
              // dinh vi truc tiep) nen z-index bi TRINH DUYET BO QUA HOAN
              // TOAN, vo nghia. Phan tu THAT SU duoc floating-ui gan
              // position:absolute/fixed la `component.element` nay (container
              // goc do ReactRenderer tao ra, truyen vao props.mount() ben
              // duoi) - phai gan z-index THANG len day moi co hieu luc.
              component.element.style.zIndex = "9999";
              unmount = props.mount(component.element);
            },
            onUpdate: (props) => {
              component?.updateProps({
                items: props.items,
                command: (item: SlashCommandItem) => props.command(item),
              });
            },
            onKeyDown: (props) => {
              if (props.event.key === "Escape") {
                closeWithAnimation();
                return true;
              }
              return component?.ref?.onKeyDown(props) ?? false;
            },
            onExit: () => {
              closeWithAnimation();
            },
          };
        },
      }),
    ];
  },
});
