import { LEGEND_ITEMS, getStatusStyle } from "@/lib/skill-tree/status-style";

// Muc dieu huong (Overview/Skill Tree/Galaxy View/.../Notes) da chuyen het
// sang sidebar chinh (career-tree/sidebar.tsx), long trong nhom "My Town" -
// component nay gio chi con Legend trang thai, khong con nhan props gi.
const SkillTreeSidebar = () => {
  return (
    <aside className="flex w-72 shrink-0 flex-col gap-5 overflow-y-auto border-r border-border p-4">
      <div>
        <p className="mb-2 text-[10px] font-semibold tracking-wide text-ink-faint uppercase">
          Trạng thái
        </p>
        <div className="flex flex-col gap-1.5">
          {LEGEND_ITEMS.map(({ status, label }) => (
            <span
              key={status}
              className="flex items-center gap-2 text-xs text-ink-muted"
            >
              <span
                className={`size-1.5 shrink-0 rounded-full ${getStatusStyle(status).dotClass}`}
              />
              {label}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default SkillTreeSidebar;
