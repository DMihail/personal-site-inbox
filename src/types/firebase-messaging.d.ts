declare module "firebase/messaging" {
  import type { FirebaseApp } from "firebase/app";
  import type { PushPayload } from "@/push/types";

  export type MessagePayload = PushPayload;

  export function getMessaging(app?: FirebaseApp): unknown;
  export function getToken(
    messaging: unknown,
    options: { vapidKey: string; serviceWorkerRegistration: ServiceWorkerRegistration },
  ): Promise<string>;
  export function deleteToken(messaging: unknown): Promise<boolean>;
  export function isSupported(): Promise<boolean>;
  export function onMessage(
    messaging: unknown,
    handler: (payload: MessagePayload) => void,
  ): () => void;
}
