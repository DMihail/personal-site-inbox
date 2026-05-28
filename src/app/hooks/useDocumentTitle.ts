import { useEffect } from "react";

const APP_NAME = "Developer Inbox";

export function useDocumentTitle(pageTitle: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = pageTitle ? `${pageTitle} · ${APP_NAME}` : APP_NAME;
    return () => {
      document.title = previous;
    };
  }, [pageTitle]);
}
