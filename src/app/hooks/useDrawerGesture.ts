import { useCallback, useLayoutEffect, useRef, useState } from "react";
import {
  clampOffset,
  getClosedOffset,
  isEdgeSwipeStart,
  resolveDrawerOpen,
  type DrawerSide,
} from "./drawerGesture";

interface UseDrawerGestureOptions {
  enabled: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: DrawerSide;
  edgeWidth?: number;
  panelRef: React.RefObject<HTMLElement | null>;
}

export function useDrawerGesture({
  enabled,
  open,
  onOpenChange,
  side = "start",
  edgeWidth = 24,
  panelRef,
}: UseDrawerGestureOptions) {
  const [drawerWidth, setDrawerWidth] = useState(320);
  const [dragOffset, setDragOffset] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({
    pointerId: -1,
    startX: 0,
    startOffset: 0,
    lastX: 0,
    lastTime: 0,
  });

  const measureWidth = useCallback(() => {
    const width = panelRef.current?.getBoundingClientRect().width;
    if (width && width > 0) setDrawerWidth(width);
  }, [panelRef]);

  useLayoutEffect(() => {
    measureWidth();
    if (!enabled) return;

    const panel = panelRef.current;
    if (!panel) return;

    const observer = new ResizeObserver(() => measureWidth());
    observer.observe(panel);
    window.addEventListener("resize", measureWidth);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measureWidth);
    };
  }, [enabled, measureWidth, panelRef]);

  const closedOffset = getClosedOffset(drawerWidth, side);
  const restingOffset = open ? 0 : closedOffset;
  const offset = dragOffset ?? restingOffset;

  const finishDrag = useCallback(
    (clientX: number) => {
      const { lastX, lastTime } = dragRef.current;
      const velocityX = (clientX - lastX) / Math.max(16, Date.now() - lastTime);
      const shouldOpen = resolveDrawerOpen(offset, closedOffset, velocityX);
      setIsDragging(false);
      setDragOffset(null);
      dragRef.current.pointerId = -1;
      onOpenChange(shouldOpen);
    },
    [closedOffset, offset, onOpenChange],
  );

  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (!enabled || event.pointerType === "mouse") return;
      measureWidth();
      const onPanel = panelRef.current?.contains(event.target as Node) ?? false;
      const fromEdge = isEdgeSwipeStart(event.clientX, edgeWidth, side);

      if (!open && !fromEdge) return;
      if (open && !onPanel && !fromEdge) return;

      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startOffset: restingOffset,
        lastX: event.clientX,
        lastTime: Date.now(),
      };
      setIsDragging(true);
      setDragOffset(restingOffset);
      (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
    },
    [enabled, edgeWidth, measureWidth, open, panelRef, restingOffset, side],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (!isDragging || event.pointerId !== dragRef.current.pointerId) return;
      const { startX, startOffset } = dragRef.current;
      const delta = event.clientX - startX;
      const next = side === "start" ? startOffset + delta : startOffset - delta;
      setDragOffset(clampOffset(next, closedOffset));
      dragRef.current.lastX = event.clientX;
      dragRef.current.lastTime = Date.now();
    },
    [closedOffset, isDragging, side],
  );

  const onPointerUp = useCallback(
    (event: React.PointerEvent) => {
      if (!isDragging || event.pointerId !== dragRef.current.pointerId) return;
      finishDrag(event.clientX);
    },
    [finishDrag, isDragging],
  );

  const onPointerCancel = useCallback(
    (event: React.PointerEvent) => {
      if (!isDragging || event.pointerId !== dragRef.current.pointerId) return;
      finishDrag(event.clientX);
    },
    [finishDrag, isDragging],
  );

  const progress = closedOffset === 0 ? 1 : 1 - Math.abs(offset) / Math.abs(closedOffset);

  return {
    offset,
    isDragging,
    backdropOpacity: Math.min(0.65, Math.max(0, progress * 0.65)),
    panelStyle: {
      transform: `translateX(${offset}px)`,
      transition: isDragging ? "none" : "transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)",
      willChange: isDragging ? "transform" : "auto",
    } as const,
    rootHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
    },
  };
}
