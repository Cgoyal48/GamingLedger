import type { ReactNode } from "react";

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="panel flex flex-col items-center gap-3 px-6 py-14 text-center">
      <p className="hud-label">Empty slot</p>
      <p className="text-xl font-semibold">{title}</p>
      {children}
    </div>
  );
}
