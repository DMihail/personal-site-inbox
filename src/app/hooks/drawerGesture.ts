export type DrawerSide = "start" | "end";

export function getClosedOffset(width: number, side: DrawerSide): number {
  return side === "start" ? -width : width;
}

/** 0 = fully open, closedOffset = fully closed */
export function clampOffset(value: number, closedOffset: number): number {
  if (closedOffset < 0) {
    return Math.min(0, Math.max(closedOffset, value));
  }
  return Math.max(0, Math.min(closedOffset, value));
}

export function resolveDrawerOpen(
  offset: number,
  closedOffset: number,
  velocityX: number,
): boolean {
  if (Math.abs(velocityX) > 0.45) {
    if (closedOffset < 0) return velocityX > 0;
    return velocityX < 0;
  }
  return Math.abs(offset) < Math.abs(closedOffset) * 0.65;
}

export function isEdgeSwipeStart(clientX: number, edgeWidth: number, side: DrawerSide): boolean {
  if (side === "start") return clientX <= edgeWidth;
  return typeof window !== "undefined" && clientX >= window.innerWidth - edgeWidth;
}
