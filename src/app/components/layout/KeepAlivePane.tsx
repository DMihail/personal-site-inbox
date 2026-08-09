import type { ReactNode } from "react";

type PaneMode = "visible" | "hidden";

/**
 * Keep-alive pane (React `<Activity>` alternative).
 *
 * React DevTools currently crashes when revealing some `<Activity>` subtrees
 * ("The children should not have changed if we pass in the same set",
 * facebook/react#35734). This helper preserves mounted state with CSS + inert
 * until DevTools catches up.
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

  return (
    <div
      className={hidden ? "hidden" : className}
      aria-hidden={hidden || undefined}
      inert={hidden ? true : undefined}
    >
      {children}
    </div>
  );
}
