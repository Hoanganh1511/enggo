"use client";

import { useState } from "react";
import SectionLabel from "./SectionLabel";
import type { NodeKind } from "@/lib/api/types";

type AddChildBoxProps = {
  onAddChild: (name: string, kind: NodeKind) => void;
};

const AddChildBox = ({ onAddChild }: AddChildBoxProps) => {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<NodeKind>("BRANCH");

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAddChild(trimmed, kind);
    setName("");
  };

  return (
    <div>
      <SectionLabel>Thêm nhánh con</SectionLabel>
      <div className="mt-2 flex flex-wrap gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Tên nhánh con..."
          className="min-w-40 flex-1 rounded-lg border border-dashed border-hover-border bg-surface px-3 py-1.5 text-sm text-ink placeholder:text-ink-faint focus:border-solid focus:border-focus-border focus:outline-none"
        />
        <div className="flex shrink-0 rounded-lg border border-border p-0.5">
          <button
            type="button"
            onClick={() => setKind("BRANCH")}
            className={`cursor-pointer rounded px-2 py-1 text-xs font-medium transition-colors duration-150 ease-out ${
              kind === "BRANCH"
                ? "bg-active-bg text-ink"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            Nhánh kiến thức
          </button>
          <button
            type="button"
            onClick={() => setKind("TOPIC")}
            className={`cursor-pointer rounded px-2 py-1 text-xs font-medium transition-colors duration-150 ease-out ${
              kind === "TOPIC"
                ? "bg-active-bg text-ink"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            Chủ đề cần học sâu
          </button>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          className="cursor-pointer rounded-lg bg-primary px-3 py-1.5 text-sm text-white transition-colors duration-150 ease-out hover:bg-primary-hover"
        >
          Thêm
        </button>
      </div>
    </div>
  );
};

export default AddChildBox;
