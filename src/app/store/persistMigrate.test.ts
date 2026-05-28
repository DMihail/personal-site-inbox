import { describe, expect, it } from "vitest";
import { migrateAuthPersist, migratePushPersist } from "./persistMigrate";

describe("persistMigrate", () => {
  it("migrates auth store legacy payloads", () => {
    expect(migrateAuthPersist({ lastKnownUid: "abc" })).toEqual({ lastKnownUid: "abc" });
    expect(migrateAuthPersist({ lastKnownUid: null })).toEqual({ lastKnownUid: null });
    expect(migrateAuthPersist(null)).toEqual({ lastKnownUid: null });
  });

  it("migrates push store legacy payloads", () => {
    expect(
      migratePushPersist({
        enabled: true,
        subscriptionEndpoint: "https://push.example",
        token: "fcm-token",
      }),
    ).toEqual({ enabled: true });
    expect(migratePushPersist({ enabled: false })).toEqual({ enabled: false });
  });
});
