import { NavLink } from "react-router";
import { useCopies } from "@/api/games/hooks";
import { cn } from "@/lib/utils";
import { KeyHint } from "@app/shared/components/KeyHint";
import { isNeverLaunched } from "@app/shared/utils/value";
import { pages } from "@app/shell/constants/pages";

export function PageTabs() {
  const questCount = (useCopies().data ?? []).filter(isNeverLaunched).length;

  return (
    <nav aria-label="Pages" className="-mb-px flex overflow-x-auto">
      {pages.map((page) => (
        <NavLink
          key={page.to}
          to={page.to}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2 border-b-2 px-3 py-2.5 font-mono text-xs tracking-[0.16em] whitespace-nowrap uppercase transition-colors",
              isActive
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )
          }
        >
          <KeyHint>{page.key}</KeyHint>
          {page.label}
          {page.to === "/quests" && questCount > 0 ? <span className="numeric text-amber">{questCount}</span> : null}
        </NavLink>
      ))}
    </nav>
  );
}
