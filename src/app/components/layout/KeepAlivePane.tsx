import { useLayoutEffect, useRef, type ReactNode } from "react";

type PaneMode = "visible" | "hidden";

/**
 * Keep-alive pane (React `<Activity>` alternative).
 *
 * React DevTools currently crashes when revealing some `<Activity>` subtrees
 * ("The children should not have changed if we pass in the same set",
 * facebook/react#35734). This helper preserves mounted state with CSS + inert
 * until DevTools catches up.
 *
 * Uses `inert` (not `aria-hidden`) so a focused control inside a just-hidden
 * pane is not reported as hidden from assistive tech.
 */
export function KeepAlivePane({
  mode,
  children,
  className,
}: {
  mode: PaneMode;
  children: ReactNode;
  className?: string;
}) {
  const hidden = mode === "hidden";
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!hidden) return;
    const root = rootRef.current;
    const active = document.activeElement;
    if (root && active instanceof HTMLElement && root.contains(active)) {
      active.blur();
    }
  }, [hidden]);

  return (
    <div ref={rootRef} className={hidden ? "hidden" : className} inert={hidden ? true : undefined}>
      {children}
    </div>
  );
}
