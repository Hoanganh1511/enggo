// Bo "form kit" dung chung cho moi form dat trong TransformModal (xem
// transform-modal.tsx) - rut ra tu CreateWorkspaceModal.tsx (modal "Tao
// workspace", noi dau tien dung TransformModal) de CreateGroupButton.tsx va
// cac modal sau nay khong phai go lai tung className tay. Giu HARDCODE
// cyan/slate/white (khong phai token var(--...)) - dong bo voi TransformModal
// va ca "vu tru" Workspace, co chu dich khong doi theo theme sang/toi.
export function ModalFieldLabel({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="text-xs font-semibold text-slate-300">
      {children}
    </label>
  );
}

export function ModalInput({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-9 rounded-md border border-white/8 bg-white/3 px-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-300/40 ${className}`}
    />
  );
}

export function ModalTextarea({
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`resize-none rounded-md border border-white/8 bg-white/3 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-300/40 ${className}`}
    />
  );
}

export function ModalErrorText({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-medium text-red-400">{children}</p>;
}

export function ModalHint({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] text-slate-500">{children}</p>;
}

export function ModalSubmitButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="submit"
      {...props}
      className={`mt-1 h-9 cursor-pointer rounded-md bg-linear-to-r from-cyan-500 to-blue-500 text-sm font-semibold text-white transition-opacity duration-150 ease-out hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}

// Segmented toggle 2 lua chon (vd Cong khai/Rieng tu) - dung mau active
// giong ModalSubmitButton (gradient cyan->blue) de dong bo 1 "hanh dong
// chinh" duy nhat trong form.
export function ModalSegmentedToggle<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="flex items-center gap-1 rounded-md border border-white/8 bg-white/3 p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`h-8 flex-1 cursor-pointer rounded-sm text-xs font-semibold transition-colors duration-150 ease-out ${
            value === opt.value
              ? "bg-linear-to-r from-cyan-500 to-blue-500 text-white"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
