"use client";

import { useState } from "react";
import SectionLabel from "./SectionLabel";

type AddChildBoxProps = {
  onAddChild: (name: string) => void;
};

const AddChildBox = ({ onAddChild }: AddChildBoxProps) => {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAddChild(trimmed);
    setName("");
  };

  return (
    <div>
      <SectionLabel>Thêm nhánh con</SectionLabel>
      <div className="mt-2 flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Tên nhánh con..."
          className="flex-1 rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-solid focus:border-gray-900 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleSubmit}
          className="cursor-pointer rounded-lg bg-gray-900 px-3 py-1.5 text-sm text-white transition-colors hover:bg-gray-800"
        >
          Thêm
        </button>
      </div>
    </div>
  );
};

export default AddChildBox;
