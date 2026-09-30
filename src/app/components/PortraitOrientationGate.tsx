import { useLayoutEffect, useRef } from "react";
import { Smartphone } from "lucide-react";

interface PortraitOrientationGateProps {
  open: boolean;
}

/**
 * Blocks phone/tablet landscape: the inbox chrome is designed for portrait only.
 * Callers must mark the rest of the app `inert` while `open` is true.
 * Installed PWA also declares `orientation: portrait`.
 */
export function PortraitOrientationGate({ open }: PortraitOrientationGateProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      // No actionable controls — keep focus on the dialog itself.
      event.preventDefault();
      dialog.focus({ preventScroll: true });
    };

    dialog.addEventListener("keydown", onKeyDown);
    return () => {
      dialog.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      className="portrait-orientation-gate"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="portrait-orientation-title"
      aria-describedby="portrait-orientation-desc"
    >
      <div className="portrait-orientation-gate__card glass-elevated border border-glass-border">
        <Smartphone
          className="portrait-orientation-gate__icon text-cyan"
          aria-hidden="true"
        />
        <h2 id="portrait-orientation-title" className="text-heading-sm text-text-primary">
          Rotate to portrait
        </h2>
        <p id="portrait-orientation-desc" className="text-body-sm text-text-secondary">
          This inbox is designed for portrait mode on phones and tablets. Turn your device
          upright to continue.
        </p>
      </div>
    </div>
  );
}
