type BoardNodeCardProps = {
  title: string;
  description?: string;
  variant: "parent" | "child";
};

const BoardNodeCard = ({ title, description, variant }: BoardNodeCardProps) => {
  const isParent = variant === "parent";
  return (
    <div
      className={`min-w-[180px] rounded-xl bg-white px-4 py-3 shadow-sm dark:bg-zinc-900 ${
        isParent
          ? "boredr-2 border-zinc-300 dark:border-zinc-700"
          : "border border-zinc-200 text-sm dark:border-zinc-800"
      }`}
    >
      <p className="font-medium text-foreground">{title}</p>
      {description ? (
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      ) : null}
    </div>
  );
};

export default BoardNodeCard;
