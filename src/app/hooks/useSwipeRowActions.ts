import { useCallback, useEffect, useRef, useState } from "react";
import {
  clampSwipeOffset,
  resolveSwipeOpen,
  SWIPE_AXIS_LOCK_PX,
  SWIPE_MAX_REVEAL,
} from "./swipeRowGesture";
import * as React from "react";

interface UseSwipeRowActionsOptions {
  enabled: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maxReveal?: number;
}

/**
 * Touch horizontal swipe that reveals trailing actions (Mail-style).
 * Ignores mouse; cancels when the gesture is mostly vertical (list scroll).
 */
export function useSwipeRowActions({
  enabled,
  open,
  onOpenChange,
  maxReveal = SWIPE_MAX_REVEAL,
}: UseSwipeRowActionsOptions) {
  const [dragOffset, setDragOffset] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const suppressedClickRef = useRef(false);
  const dragRef = useRef({
    pointerId: -1,
    startX: 0,
    startY: 0,
    startOffset: 0,
    currentOffset: 0,
    lastX: 0,
    lastTime: 0,
    axis: "undecided" as "undecided" | "horizontal" | "vertical",
  });

  const restingOffset = open ? -maxReveal : 0;
  const offset = dragOffset ?? restingOffset;

  useEffect(() => {
    if (!enabled && open) onOpenChange(false);
  }, [enabled, open, onOpenChange]);

  const finishDrag = useCallback(
    (clientX: number) => {
      const { lastX, lastTime, axis, startX, currentOffset } = dragRef.current;
      const velocityX = (clientX - lastX) / Math.max(16, Date.now() - lastTime);
      const moved = Math.abs(clientX - startX);

      setIsDragging(false);
      setDragOffset(null);
      dragRef.current.pointerId = -1;
      dragRef.current.axis = "undecided";

      if (axis === "vertical") return;

      if (moved >= SWIPE_AXIS_LOCK_PX) {
        suppressedClickRef.current = true;
      }

      onOpenChange(resolveSwipeOpen(currentOffset, velocityX, maxReveal));
    },
    [maxReveal, onOpenChange],
  );

  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (!enabled || event.pointerType === "mouse") return;
      if ((event.target as HTMLElement).closest("[data-swipe-action]")) return;

      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startOffset: restingOffset,
        currentOffset: restingOffset,
        lastX: event.clientX,
        lastTime: Date.now(),
        axis: "undecided",
      };
      setIsDragging(true);
      setDragOffset(restingOffset);
      (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
    },
    [enabled, restingOffset],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (!isDragging || event.pointerId !== dragRef.current.pointerId) return;

      const { startX, startY, startOffset, axis } = dragRef.current;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;

      if (axis === "undecided") {
        if (Math.abs(dx) < SWIPE_AXIS_LOCK_PX && Math.abs(dy) < SWIPE_AXIS_LOCK_PX) return;
        dragRef.current.axis = Math.abs(dx) >= Math.abs(dy) ? "horizontal" : "vertical";
        if (dragRef.current.axis === "vertical") {
          setIsDragging(false);
          setDragOffset(null);
          dragRef.current.pointerId = -1;
          return;
        }
      }

      if (dragRef.current.axis !== "horizontal") return;

      const nextOffset = clampSwipeOffset(startOffset + dx, maxReveal);
      dragRef.current.currentOffset = nextOffset;
      setDragOffset(nextOffset);
      dragRef.current.lastX = event.clientX;
      dragRef.current.lastTime = Date.now();
    },
    [isDragging, maxReveal],
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

  const consumeSuppressedClick = useCallback(() => {
    if (!suppressedClickRef.current) return false;
    suppressedClickRef.current = false;
    return true;
  }, []);

  return {
    offset,
    isDragging,
    isOpen: open,
    maxReveal,
    surfaceStyle: {
      transform: `translate3d(${offset}px, 0, 0)`,
      transition: isDragging ? "none" : "transform 0.28s cubic-bezier(0.32, 0.72, 0, 1)",
    } as const,
    surfaceHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
    },
    consumeSuppressedClick,
  };
}
