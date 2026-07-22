import { getTechIcon } from "@/lib/career-tree/tech-icons";

const TechTag = ({ name }: { name: string }) => {
  const icon = getTechIcon(name);
  return (
    <span className="flex items-center gap-1.5 rounded-md bg-surface-muted px-2 py-1 text-xs font-medium text-ink">
      {icon ? (
        <svg viewBox="0 0 24 24" width={12} height={12} fill={icon.color}>
          <path d={icon.path} />
        </svg>
      ) : (
        <span className="h-3 w-3 rounded-full bg-ink-disabled" />
      )}
      {name}
    </span>
  );
};

export default TechTag;
