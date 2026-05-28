import { useEffect, useState } from "react";
import { MEDIA_QUERIES } from "@/shared/constants/media-queries";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** md ≤ width < lg — tablet layout with message-list drawer */
export function useIsTabletLayout(): boolean {
  return useMediaQuery(MEDIA_QUERIES.tablet);
}
