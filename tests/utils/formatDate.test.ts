import { describe, expect, it } from "vitest";
import {
  formatClockTime,
  formatDateTime,
  formatMediumDate,
  formatRelativeTime,
  formatShortDate,
} from "@/utils/formatDate";

describe("formatDate", () => {
  const now = Date.parse("2024-06-15T12:00:00.000Z");

  it("formats relative times with a suffix-style Intl result", () => {
    expect(formatRelativeTime(new Date(now - 30_000), now)).toMatch(/second|ago|now/i);
    expect(formatRelativeTime(new Date(now - 3 * 60 * 60_000), now)).toMatch(/hour/i);
  });

  it("formats calendar and clock values without throwing", () => {
    const date = new Date("2024-06-15T12:00:00.000Z");
    expect(formatShortDate(date).length).toBeGreaterThan(2);
    expect(formatMediumDate(date)).toMatch(/2024/);
    expect(formatClockTime(date)).toMatch(/\d{1,2}:\d{2}/);
    expect(formatDateTime(date).length).toBeGreaterThan(8);
  });
});
