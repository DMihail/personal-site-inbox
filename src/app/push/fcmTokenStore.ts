import { getFirestoreDb } from "@/utils/firestore";
import { getOrCreatePushDeviceId } from "./pushDeviceId";
import { isIosLikeDevice } from "@/pwa/runtime";

export type PushPlatform = "ios" | "android" | "desktop" | "unknown";

export function getPushPlatform(): PushPlatform {
  if (typeof navigator === "undefined") return "unknown";
  if (isIosLikeDevice()) return "ios";
  if (/Android/i.test(navigator.userAgent)) return "android";
  if (window.matchMedia("(min-width: 768px)").matches) return "desktop";
  return "unknown";
}

function deviceDocPath(uid: string, deviceId: string) {
  return ["fcmTokens", uid, "devices", deviceId] as const;
}

/** Writes this device's FCM token and removes legacy single-token `fcmTokens/{uid}` doc. */
export async function saveDeviceFcmToken(uid: string, token: string): Promise<string> {
  const deviceId = getOrCreatePushDeviceId();
  const firestoreDb = await getFirestoreDb();
  const { doc, deleteDoc, getDoc, serverTimestamp, setDoc } = await import("firebase/firestore");

  await setDoc(
    doc(firestoreDb, ...deviceDocPath(uid, deviceId)),
    {
      token,
      uid,
      platform: getPushPlatform(),
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 200) : "",
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  const legacyRef = doc(firestoreDb, "fcmTokens", uid);
  const legacy = await getDoc(legacyRef);
  if (legacy.exists() && typeof legacy.data()?.token === "string") {
    await deleteDoc(legacyRef).catch(() => undefined);
  }

  return deviceId;
}

/** Removes only this device's token (other devices keep receiving push). */
export async function removeDeviceFcmToken(uid: string): Promise<void> {
  const deviceId = getOrCreatePushDeviceId();
  const firestoreDb = await getFirestoreDb();
  const { deleteDoc, doc } = await import("firebase/firestore");
  await deleteDoc(doc(firestoreDb, ...deviceDocPath(uid, deviceId))).catch(() => undefined);
}
