/** Shared viewport breakpoints (align with Tailwind md/lg). */
export const MEDIA_QUERIES = {
  tablet: "(min-width: 768px) and (max-width: 1023px)",
  desktop: "(min-width: 1024px)",
  mdUp: "(min-width: 768px)",
  /** Phone / tablet held sideways — inbox UI is portrait-only below desktop. */
  phoneOrTabletLandscape: "(max-width: 1023px) and (orientation: landscape)",
} as const;
