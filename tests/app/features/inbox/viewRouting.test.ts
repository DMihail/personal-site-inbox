import { describe, expect, it } from "vitest";
import { DEFAULT_VIEW, pathToView, viewToPath } from "@/app/features/inbox/viewRouting";

describe("viewRouting", () => {
  describe("viewToPath", () => {
    it.each([
      ["inbox", "/inbox"],
      ["unread", "/unread"],
      ["important", "/important"],
      ["archived", "/archived"],
      ["settings", "/settings"],
    ] as const)("maps %s to %s", (view, path) => {
      expect(viewToPath(view)).toBe(path);
    });
  });

  describe("pathToView", () => {
    it.each([
      ["/inbox", "inbox"],
      ["/unread", "unread"],
      ["/important", "important"],
      ["/archived", "archived"],
      ["/settings", "settings"],
      ["/", DEFAULT_VIEW],
      ["", DEFAULT_VIEW],
      ["/inbox/", "inbox"],
      ["/unknown", DEFAULT_VIEW],
    ] as const)("maps %s to %s", (path, view) => {
      expect(pathToView(path)).toBe(view);
    });
  });
});
