import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDocumentTitle } from "@/app/hooks/useDocumentTitle";

describe("useDocumentTitle", () => {
  it("sets document title with app name suffix", () => {
    const { unmount } = renderHook(() => useDocumentTitle("Inbox"));

    expect(document.title).toBe("Inbox · Developer Inbox");

    unmount();
  });
});
