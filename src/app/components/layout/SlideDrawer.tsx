import { useEffect, useEffectEvent, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
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

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

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
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const focusBeforeOpenRef = useRef<HTMLElement | null>(null);
  const shouldStayMounted = open || persistent;
  const [mounted, setMounted] = useState(shouldStayMounted);
  const onEscapeClose = useEffectEvent(() => {
    onClose();
  });

  // Adjust mount flag during render when opening (React-supported pattern).
  if (shouldStayMounted && !mounted) {
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
    if (shouldStayMounted || !mounted) return;
    const timer = window.setTimeout(() => setMounted(false), CLOSE_MS);
    return () => window.clearTimeout(timer);
  }, [shouldStayMounted, mounted]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onEscapeClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useLayoutEffect(() => {
    if (open) {
      const active = document.activeElement;
      focusBeforeOpenRef.current = active instanceof HTMLElement ? active : null;
      return;
    }

    const root = rootRef.current;
    const active = document.activeElement;
    if (!(active instanceof HTMLElement) || !root?.contains(active)) {
      return;
    }

    active.blur();
    const restore = focusBeforeOpenRef.current;
    if (restore?.isConnected) {
      restore.focus({ preventScroll: true });
    }
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;

    const root = rootRef.current;
    const panel = panelRef.current;
    if (!root || !panel) return;

    const getFocusables = () =>
      Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (element) => element.tabIndex !== -1 && !element.closest("[inert]"),
      );

    const focusFrame = window.requestAnimationFrame(() => {
      const panelFirst = panel.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      (panelFirst ?? getFocusables()[0])?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = getFocusables();
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    root.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      root.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!mounted) return null;

  const sideClass =
    side === "start" ? "inset-y-0 start-0 border-e" : "inset-y-0 end-0 border-s";

  return (
    <div
      ref={rootRef}
      className={`slide-drawer-root fixed inset-0 z-50 touch-none ${open ? "" : "pointer-events-none"}`.trim()}
      role={open ? "dialog" : undefined}
      aria-modal={open ? true : undefined}
      aria-labelledby={open ? titleId : undefined}
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
        style={panelStyle}
        inert={!open ? true : undefined}
        className={`slide-drawer-panel pointer-events-auto absolute flex flex-col border-glass-border bg-background shadow-2xl ${sideClass} ${panelClassName}`.trim()}
      >
        {children}
      </aside>
    </div>
  );
}
