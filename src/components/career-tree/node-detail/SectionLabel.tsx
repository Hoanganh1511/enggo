import type { ReactNode } from "react";

type SectionLabelProps = {
  children: ReactNode;
};

const SectionLabel = ({ children }: SectionLabelProps) => (
  <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
    {children}
  </p>
);

export default SectionLabel;
