type ToolbarProps = {
  onAddBoard: () => void;
};

const Toolbar = ({ onAddBoard }: ToolbarProps) => {
  return (
    <div className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 shadow-md ring-1 ring-black/5 dark:bg-zinc-900/90 dark:ring-white/10">
      <button
        type="button"
        onClick={onAddBoard}
        className="flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-sm font-medium text-background transition-colors hover:opacity-90"
      >
        <span className="text-base leading-none">+</span>
        Tạo bảng
      </button>
    </div>
  );
};

export default Toolbar;
