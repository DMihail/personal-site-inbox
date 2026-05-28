import { describe, expect, it } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTabletMessagesList } from "./useTabletMessagesList";

describe("useTabletMessagesList", () => {
  it("auto-opens on tablet when no message is selected", () => {
    const { result } = renderHook(() =>
      useTabletMessagesList({
        isTablet: true,
        currentView: "inbox",
        selectedMessageId: null,
      }),
    );
    expect(result.current.messagesListOpen).toBe(true);
  });

  it("closes when a message is selected", () => {
    const { result, rerender } = renderHook(
      ({ selectedMessageId }: { selectedMessageId: string | null }) =>
        useTabletMessagesList({
          isTablet: true,
          currentView: "inbox",
          selectedMessageId,
        }),
      { initialProps: { selectedMessageId: null as string | null } },
    );

    rerender({ selectedMessageId: "msg-1" });
    expect(result.current.messagesListOpen).toBe(false);
  });

  it("respects explicit close", () => {
    const { result } = renderHook(() =>
      useTabletMessagesList({
        isTablet: true,
        currentView: "inbox",
        selectedMessageId: null,
      }),
    );

    act(() => result.current.onCloseMessagesList());
    expect(result.current.messagesListOpen).toBe(false);
  });
});
