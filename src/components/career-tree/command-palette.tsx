"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Search } from "lucide-react";
import type { AppNode } from "@/lib/career-tree/types";

type CommandPaletteProps = {
  onClose: () => void;
  nodes: AppNode[];
  onSelect: (nodeId: string) => void;
};

const CommandPalette = ({ onClose, nodes, onSelect }: CommandPaletteProps) => {
  const [query, setQuery] = useState("");

  const results = nodes
    .filter((n) => n.data.title.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => a.data.depth - b.data.depth);

  return (
    <Dialog.Root open onOpenChange={(next) => { if (!next) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-32 z-50 w-[calc(100%-3rem)] max-w-lg -translate-x-1/2 overflow-hidden rounded-2xl border border-gray-200 bg-white focus:outline-none">
          <Dialog.Title className="sr-only">Tìm node</Dialog.Title>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (results.length > 0) onSelect(results[0].id);
            }}
            className="flex items-center gap-3 border-b border-gray-100 px-4 py-3"
          >
            <Search size={16} strokeWidth={1.75} className="shrink-0 text-gray-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm node theo tên…"
              className="w-full text-sm text-gray-900 outline-none placeholder:text-gray-400"
            />
          </form>
          <div className="max-h-80 overflow-y-auto p-2">
            {results.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-gray-400">
                Không tìm thấy node nào
              </p>
            ) : (
              results.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => onSelect(n.id)}
                  style={{ paddingLeft: 12 + n.data.depth * 16 }}
                  className="flex w-full cursor-pointer items-center rounded-lg py-2 pr-3 text-left text-sm text-gray-900 transition-colors hover:bg-gray-100"
                >
                  {n.data.depth > 0 && (
                    <span className="mr-2 text-gray-300">└</span>
                  )}
                  {n.data.title}
                </button>
              ))
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CommandPalette;
