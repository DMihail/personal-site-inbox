/** Max left-swipe reveal width (px) for inbox row actions. */
export const SWIPE_ACTION_WIDTH = 72;
const SWIPE_ACTION_COUNT = 3;
export const SWIPE_MAX_REVEAL = SWIPE_ACTION_WIDTH * SWIPE_ACTION_COUNT;

/** Horizontal movement before we treat the gesture as a swipe (not a tap). */
export const SWIPE_AXIS_LOCK_PX = 8;

/** Snap open when past this fraction of max reveal (or fast velocity). */
const OPEN_FRACTION = 0.35;
const OPEN_VELOCITY = -0.45;

export function clampSwipeOffset(offset: number, maxReveal = SWIPE_MAX_REVEAL): number {
  if (offset > 0) return 0;
  if (offset < -maxReveal) return -maxReveal;
  return offset;
}

/** Decide whether the row should stay open after pointer release. */
export function resolveSwipeOpen(
  offset: number,
  velocityX: number,
  maxReveal = SWIPE_MAX_REVEAL,
): boolean {
  if (velocityX <= OPEN_VELOCITY) return true;
  if (velocityX >= -OPEN_VELOCITY) return false;
  return Math.abs(offset) >= maxReveal * OPEN_FRACTION;
}
