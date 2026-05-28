import { useEffect, type RefObject } from "react";
import { isEdgeSwipeStart } from "./drawerGesture";

interface UseEdgeDrawerOpenGestureOptions {
  enabled: boolean;
  onOpen: () => void;
  targetRef?: RefObject<HTMLElement | null>;
  edgeWidth?: number;
}

/** Opens a start-side drawer when the user swipes inward from the left screen edge. */
export function useEdgeDrawerOpenGesture({
  enabled,
  onOpen,
  targetRef,
  edgeWidth = 28,
}: UseEdgeDrawerOpenGestureOptions) {
  useEffect(() => {
    if (!enabled) return;

    const target = targetRef?.current ?? document.documentElement;
    let tracking = false;
    let startX = 0;

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse") return;
      if (!isEdgeSwipeStart(event.clientX, edgeWidth, "start")) return;
      tracking = true;
      startX = event.clientX;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!tracking) return;
      if (event.clientX - startX > 52) {
        tracking = false;
        onOpen();
      }
    };

    const onPointerUp = () => {
      tracking = false;
    };

    target.addEventListener("pointerdown", onPointerDown, { passive: true });
    target.addEventListener("pointermove", onPointerMove, { passive: true });
    target.addEventListener("pointerup", onPointerUp, { passive: true });
    target.addEventListener("pointercancel", onPointerUp, { passive: true });

    return () => {
      target.removeEventListener("pointerdown", onPointerDown);
      target.removeEventListener("pointermove", onPointerMove);
      target.removeEventListener("pointerup", onPointerUp);
      target.removeEventListener("pointercancel", onPointerUp);
    };
  }, [enabled, edgeWidth, onOpen, targetRef]);
}
