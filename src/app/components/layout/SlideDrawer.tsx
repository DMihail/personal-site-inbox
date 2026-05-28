import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useDrawerGesture } from "../../hooks/useDrawerGesture";
import type { DrawerSide } from "../../hooks/drawerGesture";

interface SlideDrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  side?: DrawerSide;
  panelClassName?: string;
  enableGesture?: boolean;
  edgeWidth?: number;
  labelledBy?: string;
  /** Keep mounted (tablet) so edge-swipe can open while visually closed */
  persistent?: boolean;
}

const CLOSE_MS = 320;

export function SlideDrawer({
  open,
  onClose,
  children,
  side = "start",
  panelClassName = "",
  enableGesture = true,
  edgeWidth = 24,
  labelledBy,
  persistent = false,
}: SlideDrawerProps) {
  const fallbackTitleId = useId();
  const titleId = labelledBy ?? fallbackTitleId;
  const panelRef = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(() => open || persistent);

  if ((open || persistent) && !mounted) {
    setMounted(true);
  }

  const { backdropOpacity, panelStyle, rootHandlers } = useDrawerGesture({
    enabled: enableGesture,
    open,
    onOpenChange: (next) => {
      if (!next) onClose();
    },
    side,
    edgeWidth,
    panelRef,
  });

  useEffect(() => {
    if (open || persistent || !mounted) return;
    const timer = window.setTimeout(() => setMounted(false), CLOSE_MS);
    return () => window.clearTimeout(timer);
  }, [open, persistent, mounted]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!mounted) return null;

  const sideClass =
    side === "start"
      ? "inset-y-0 start-0 border-e"
      : "inset-y-0 end-0 border-s";

  return (
    <div
      className={`slide-drawer-root fixed inset-0 z-50 touch-none ${open ? "" : "pointer-events-none"}`.trim()}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-hidden={!open}
      {...(open ? rootHandlers : {})}
    >
      {!open ? (
        <div
          className="tablet-drawer-edge pointer-events-auto absolute inset-y-0 start-0 z-10 w-7"
          aria-hidden="true"
          {...rootHandlers}
        />
      ) : null}
      <button
        type="button"
        className={`ui-transition absolute inset-0 cursor-pointer bg-black/60 backdrop-blur-[2px] ${open ? "pointer-events-auto" : "pointer-events-none"}`.trim()}
        style={{ opacity: backdropOpacity }}
        aria-label="Close panel"
        onClick={onClose}
        tabIndex={open ? 0 : -1}
      />
      <aside
        ref={panelRef}
        id={titleId}
        style={panelStyle}
        className={`slide-drawer-panel pointer-events-auto absolute flex flex-col border-glass-border bg-background shadow-2xl ${sideClass} ${panelClassName}`.trim()}
      >
        {children}
      </aside>
    </div>
  );
}
