import { useEffect } from "react";
import { APP_NAME } from "@/utils/app-info";

export function useDocumentTitle(pageTitle: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = pageTitle ? `${pageTitle} · ${APP_NAME}` : APP_NAME;
    return () => {
      document.title = previous;
    };
  }, [pageTitle]);
}
