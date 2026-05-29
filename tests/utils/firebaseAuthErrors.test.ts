import { describe, expect, it } from "vitest";
import { FirebaseError } from "firebase/app";
import { getFirebaseAuthErrorMessage } from "@/utils/firebaseAuthErrors";

describe("getFirebaseAuthErrorMessage", () => {
  it("maps invalid credential", () => {
    const error = new FirebaseError("auth/invalid-credential", "Firebase: Error");
    expect(getFirebaseAuthErrorMessage(error)).toMatch(/incorrect email or password/i);
  });

  it("falls back to message for unknown codes", () => {
    const error = new FirebaseError("auth/internal-error", "Something broke");
    expect(getFirebaseAuthErrorMessage(error)).toBe("Something broke");
  });
});
