import { Extension } from "@tiptap/core";
import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";

// [2026-09-23] "Find & Replace" (Ctrl+F/Ctrl+H) - yeu cau nguoi dung dua
// theo 1 tai lieu tham khao ve phim tat editor, muc "Ctrl+F/Ctrl+H" chua co
// trong app. KHONG dung <details>/browser-native Ctrl+F (chi tim trong VAN
// BAN DA HIEN THI TREN MAN HINH, khong biet gi ve cau truc ProseMirror nen
// khong the "Thay thế" duoc) - phai tu quet toan bo van ban trong TAI LIEU
// (doc.descendants) va luu vi tri THAT (tu-den, dang so nguyen ProseMirror)
// cho tung ket qua, roi hien thi bang Decoration (to nen vang) + dieu huong
// (Enter/Shift+Enter hoac nut mui ten) + thay the (ghi de tung ket qua qua
// tr.insertText).
//
// Kien truc: MOI thao tac tim kiem la 1 LENH RIENG (setSearchTerm/
// goToSearchResult/replaceCurrentResult/replaceAllResults) ghi ket qua vao
// CHINH extension.storage (khong phai plugin state cua ProseMirror) - don
// gian hon vi khong can xu ly appendTransaction/plugin-state rieng, chi can
// props.decorations() cua Plugin doc THANG tu storage nay moi lan editor ve
// lai (dispatch 1 transaction rong voi setMeta de bao ProseMirror "co gi do
// thay doi, ve lai decoration"). FindReplacePanel.tsx (component React o
// ben tren) la noi DUY NHAT goi cac lenh nay, dieu phoi UI (o nhap, nut
// dieu huong, nut thay the).
export type SearchMatch = { from: number; to: number };

export type SearchReplaceStorage = {
  query: string;
  results: SearchMatch[];
  currentIndex: number;
};

const searchPluginKey = new PluginKey("searchReplace");

function findMatches(doc: ProseMirrorNode, query: string): SearchMatch[] {
  if (!query.trim()) return [];
  const needle = query.toLowerCase();
  const results: SearchMatch[] = [];
  doc.descendants((node, pos) => {
    if (!node.isText || !node.text) return;
    const haystack = node.text.toLowerCase();
    let searchFrom = 0;
    while (true) {
      const foundAt = haystack.indexOf(needle, searchFrom);
      if (foundAt === -1) break;
      results.push({ from: pos + foundAt, to: pos + foundAt + query.length });
      searchFrom = foundAt + needle.length;
    }
  });
  return results;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    searchReplace: {
      setSearchTerm: (query: string) => ReturnType;
      goToSearchResult: (direction: 1 | -1) => ReturnType;
      replaceCurrentResult: (replaceText: string) => ReturnType;
      replaceAllResults: (replaceText: string) => ReturnType;
    };
  }
  interface Storage {
    searchReplace: SearchReplaceStorage;
  }
}

export const SearchReplace = Extension.create<Record<string, never>, SearchReplaceStorage>({
  name: "searchReplace",

  addStorage() {
    return { query: "", results: [], currentIndex: -1 };
  },

  addCommands() {
    return {
      setSearchTerm:
        (query: string) =>
        ({ editor, tr, dispatch }) => {
          const results = findMatches(editor.state.doc, query);
          editor.storage.searchReplace.query = query;
          editor.storage.searchReplace.results = results;
          editor.storage.searchReplace.currentIndex = results.length ? 0 : -1;
          if (dispatch) dispatch(tr.setMeta(searchPluginKey, true));
          return true;
        },
      goToSearchResult:
        (direction: 1 | -1) =>
        ({ editor, tr, dispatch }) => {
          const storage = editor.storage.searchReplace as SearchReplaceStorage;
          if (!storage.results.length) return false;
          let next = storage.currentIndex + direction;
          if (next < 0) next = storage.results.length - 1;
          if (next >= storage.results.length) next = 0;
          storage.currentIndex = next;
          if (dispatch) {
            const match = storage.results[next];
            const selection = TextSelection.create(tr.doc, match.from, match.to);
            tr.setSelection(selection).scrollIntoView().setMeta(searchPluginKey, true);
          }
          return true;
        },
      // CHI thay the 1 ket qua DANG DUOC CHON (currentIndex) - goi
      // setSearchTerm() LAI ngay sau do (o FindReplacePanel.tsx) de tinh lai
      // toan bo vi tri, vi noi dung vua doi co the lam lech het cac ket qua
      // con lai phia sau.
      replaceCurrentResult:
        (replaceText: string) =>
        ({ editor, tr, dispatch }) => {
          const storage = editor.storage.searchReplace as SearchReplaceStorage;
          if (storage.currentIndex === -1) return false;
          const match = storage.results[storage.currentIndex];
          if (dispatch) tr.insertText(replaceText, match.from, match.to);
          return true;
        },
      // Thay TAT CA - duyet tu CUOI len DAU (nguoc thu tu xuat hien) de vi
      // tri cac ket qua CHUA xu ly (nam truoc do trong tai lieu) khong bi
      // lech do do dai van ban thay the khac do dai tu khoa goc.
      replaceAllResults:
        (replaceText: string) =>
        ({ editor, tr, dispatch }) => {
          const storage = editor.storage.searchReplace as SearchReplaceStorage;
          if (!storage.results.length) return false;
          if (dispatch) {
            [...storage.results]
              .sort((a, b) => b.from - a.from)
              .forEach((match) => tr.insertText(replaceText, match.from, match.to));
          }
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    const extensionStorage = this.storage;
    return [
      new Plugin({
        key: searchPluginKey,
        props: {
          decorations(state) {
            const { results, currentIndex } = extensionStorage;
            if (!results.length) return DecorationSet.empty;
            const decorations = results.map((match, i) =>
              Decoration.inline(match.from, match.to, {
                class: i === currentIndex ? "search-match search-match-current" : "search-match",
              }),
            );
            return DecorationSet.create(state.doc, decorations);
          },
        },
      }),
    ];
  },
});
