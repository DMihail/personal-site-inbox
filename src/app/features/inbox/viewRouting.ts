import type { View } from "./types";

export const DEFAULT_VIEW: View = "inbox";

export function viewToPath(view: View) {
  if (view === "inbox") return "/inbox";
  if (view === "unread") return "/unread";
  if (view === "important") return "/important";
  if (view === "archived") return "/archived";
  if (view === "settings") return "/settings";
  return "/inbox";
}

export function pathToView(pathname: string): View {
  const p = pathname.replace(/\/+$/, "");
  if (p === "" || p === "/") return DEFAULT_VIEW;
  if (p === "/inbox") return "inbox";
  if (p === "/unread") return "unread";
  if (p === "/important") return "important";
  if (p === "/archived") return "archived";
  if (p === "/settings") return "settings";
  return DEFAULT_VIEW;
}

