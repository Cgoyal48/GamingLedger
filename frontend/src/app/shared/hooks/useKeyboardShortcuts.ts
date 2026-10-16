import { useEffect, useEffectEvent } from "react";

/** Shortcuts stay quiet while typing or while focus is inside a dialog or an open dropdown. */
function isTyping(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) ||
      target.closest("[role=dialog], [role=alertdialog], [role=listbox], [role=menu]") != null)
  );
}

/** Single-key shortcuts, keyed by lowercase key. Modifier combos are left to the browser. */
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>, enabled = true) {
  const onKey = useEffectEvent((event: KeyboardEvent) => {
    if (!enabled || event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) {
      return;
    }
    const run = shortcuts[event.key.toLowerCase()];
    if (run) {
      event.preventDefault();
      run();
    }
  });

  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
