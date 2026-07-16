import { getFirestoreDb } from "@/utils/firestore";
import { isIosLikeDevice } from "@/pwa/runtime";
import { logPush, maskToken } from "@/push/debug";
import { initDeviceId } from "@/push/device-id";

type PushPlatform = "ios" | "android" | "desktop" | "unknown";

function getPushPlatform(): PushPlatform {
  if (typeof navigator === "undefined") return "unknown";
  if (isIosLikeDevice()) return "ios";
  if (/Android/i.test(navigator.userAgent)) return "android";
  if (window.matchMedia("(min-width: 768px)").matches) return "desktop";
  return "unknown";
}

function devicePath(uid: string, deviceId: string) {
  return ["fcmTokens", uid, "devices", deviceId] as const;
}

/** Saves this device's token for multi-device push (one doc per browser/PWA install). */
export async function saveTokenToFirestore(uid: string, token: string): Promise<string> {
  const deviceId = await initDeviceId();
  const db = await getFirestoreDb();
  const { doc, deleteDoc, getDoc, serverTimestamp, setDoc } = await import("firebase/firestore");

  const ref = doc(db, ...devicePath(uid, deviceId));
  const prev = await getDoc(ref);
  const previousToken =
    prev.exists() && typeof prev.data()?.token === "string" ? prev.data()!.token : null;

  if (previousToken !== token) {
    logPush("token-saved", {
      deviceId,
      platform: getPushPlatform(),
      from: previousToken ? maskToken(previousToken) : null,
      to: maskToken(token),
    });
  } else {
    logPush("token-unchanged", { deviceId, token: maskToken(token) });
  }

  await setDoc(
    ref,
    {
      token,
      uid,
      platform: getPushPlatform(),
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 200) : "",
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  const legacyRef = doc(db, "fcmTokens", uid);
  const legacy = await getDoc(legacyRef);
  if (legacy.exists() && typeof legacy.data()?.token === "string") {
    await deleteDoc(legacyRef).catch(() => undefined);
  }

  return deviceId;
}

export async function removeTokenFromFirestore(uid: string): Promise<void> {
  const deviceId = await initDeviceId();
  const db = await getFirestoreDb();
  const { deleteDoc, doc } = await import("firebase/firestore");
  await deleteDoc(doc(db, ...devicePath(uid, deviceId))).catch(() => undefined);
  logPush("token-removed", { deviceId });
}
