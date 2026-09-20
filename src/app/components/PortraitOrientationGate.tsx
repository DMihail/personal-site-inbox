import { Smartphone } from "lucide-react";
import { MEDIA_QUERIES } from "@/shared/constants/media-queries";
import { useMediaQuery } from "@/app/hooks/useMediaQuery";

/**
 * Blocks phone/tablet landscape: the inbox chrome is designed for portrait only.
 * Desktop (lg+) is unrestricted. Installed PWA also declares `orientation: portrait`.
 */
export function PortraitOrientationGate() {
  const isPhoneOrTabletLandscape = useMediaQuery(MEDIA_QUERIES.phoneOrTabletLandscape);

  if (!isPhoneOrTabletLandscape) return null;

  return (
    <div
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
