import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type UIEvent,
} from "react";

/** Switch to windowing once the list is large enough to hurt scroll jank. */
export const MESSAGE_LIST_VIRTUALIZE_AFTER = 48;
/** Conservative row estimate (padding + clamp-2 + meta); prefer overshoot to blank gaps. */
const ESTIMATED_ROW_PX = 120;
const OVERSCAN = 8;

interface MessageVirtualListProps<T> {
  items: T[];
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  /** Classes for the scrollport (usually `scrollPaneClass`). */
  scrollClassName?: string;
  /** Classes for the `<ul>` list. */
  listClassName?: string;
  labelledBy?: string;
  "aria-label"?: string;
}

/**
 * Lightweight vertical windowing for long message lists (no extra dependency).
 * Falls back to a plain list under {@link MESSAGE_LIST_VIRTUALIZE_AFTER}.
 */
export function MessageVirtualList<T>({
  items,
  getKey,
  renderItem,
  scrollClassName = "",
  listClassName = "",
  labelledBy,
  "aria-label": ariaLabel,
}: MessageVirtualListProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(600);

  const useVirtual = items.length > MESSAGE_LIST_VIRTUALIZE_AFTER;

  useEffect(() => {
    if (!useVirtual) return;
    const el = scrollRef.current;
    if (!el) return;

    const measure = () => setViewportHeight(el.clientHeight || 600);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [useVirtual, items.length]);

  const onScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  if (!useVirtual) {
    return (
      <div className={scrollClassName}>
        <ul className={listClassName} aria-labelledby={labelledBy} aria-label={ariaLabel}>
          {items.map((item) => (
            <Fragment key={getKey(item)}>{renderItem(item)}</Fragment>
          ))}
        </ul>
      </div>
    );
  }

  const totalHeight = items.length * ESTIMATED_ROW_PX;
  const startIndex = Math.max(0, Math.floor(scrollTop / ESTIMATED_ROW_PX) - OVERSCAN);
  const visibleCount = Math.ceil(viewportHeight / ESTIMATED_ROW_PX) + OVERSCAN * 2;
  const endIndex = Math.min(items.length, startIndex + visibleCount);
  const offsetY = startIndex * ESTIMATED_ROW_PX;
  const slice = items.slice(startIndex, endIndex);

  return (
    <div ref={scrollRef} className={scrollClassName} onScroll={onScroll}>
      <div style={{ height: totalHeight, position: "relative" }}>
        <ul
          className={listClassName}
          aria-labelledby={labelledBy}
          aria-label={ariaLabel}
          style={{
            position: "absolute",
            insetInline: 0,
            top: offsetY,
            margin: 0,
          }}
        >
          {slice.map((item) => (
            <Fragment key={getKey(item)}>{renderItem(item)}</Fragment>
          ))}
        </ul>
      </div>
    </div>
  );
}
