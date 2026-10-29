import type { ReactNode } from "react";
export function Tooltip({
  term,
  children,
}: {
  term: string;
  children: ReactNode;
}) {
  return (
    <span className="context-help" tabIndex={0}>
      <span className="tooltip-term">{term}</span>
      <span role="tooltip">{children}</span>
    </span>
  );
}
