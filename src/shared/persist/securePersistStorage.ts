import type { PersistStorage, StorageValue } from "zustand/middleware";
import {
  getPersistedString,
  removePersistedString,
  setPersistedString,
} from "@/pwa/persistentBrowserStorage";

const ENCRYPTED_PREFIX = "enc:v1:";
const PBKDF2_ITERATIONS = 120_000;

function getSecret(): string | null {
  const secret = import.meta.env.VITE_ZUSTAND_STORAGE_KEY;
  return secret?.trim() ? secret : null;
}

function saltFor(name: string): Uint8Array<ArrayBuffer> {
  const encoded = new TextEncoder().encode(`personal-site-inbox:${name}`);
  return new Uint8Array(encoded);
}

async function deriveAesKey(secret: string, name: string): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltFor(name),
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function encryptPayload(plain: string, name: string, secret: string): Promise<string> {
  const key = await deriveAesKey(secret, name);
  const iv = crypto.getRandomValues(new Uint8Array(12)) as Uint8Array<ArrayBuffer>;
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(plain),
  );

  return `${ENCRYPTED_PREFIX}${bytesToBase64(iv)}.${bytesToBase64(new Uint8Array(cipher))}`;
}

async function decryptPayload(payload: string, name: string, secret: string): Promise<string> {
  if (!payload.startsWith(ENCRYPTED_PREFIX)) {
    throw new Error("Not encrypted");
  }

  const body = payload.slice(ENCRYPTED_PREFIX.length);
  const [ivB64, cipherB64] = body.split(".");
  if (!ivB64 || !cipherB64) {
    throw new Error("Invalid encrypted payload");
  }

  const key = await deriveAesKey(secret, name);
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBytes(ivB64) },
    key,
    base64ToBytes(cipherB64),
  );

  return new TextDecoder().decode(plain);
}

/**
 * Zustand persist backed by IndexedDB + `navigator.storage.persist()` (migrates legacy localStorage).
 */
export function createSecurePersistStorage<S>(): PersistStorage<S> {
  return {
    getItem: async (name) => {
      if (typeof window === "undefined") return null;

      const raw = await getPersistedString(name);
      if (!raw) return null;

      const secret = getSecret();
      if (!secret) {
        return JSON.parse(raw) as StorageValue<S>;
      }

      try {
        const json =
          raw.startsWith(ENCRYPTED_PREFIX) ?
            await decryptPayload(raw, name, secret)
          : raw;
        return JSON.parse(json) as StorageValue<S>;
      } catch {
        return null;
      }
    },

    setItem: async (name, value) => {
      if (typeof window === "undefined") return;

      const json = JSON.stringify(value);
      const secret = getSecret();

      if (!secret) {
        if (import.meta.env.PROD) {
          console.error(
            "[zustand] VITE_ZUSTAND_STORAGE_KEY is required in production — persist was not saved",
          );
          return;
        }
        console.warn(
          "[zustand] VITE_ZUSTAND_STORAGE_KEY is missing — persist is stored unencrypted",
        );
        await setPersistedString(name, json);
        return;
      }

      const encrypted = await encryptPayload(json, name, secret);
      await setPersistedString(name, encrypted);
    },

    removeItem: async (name) => {
      if (typeof window === "undefined") return;
      await removePersistedString(name);
    },
  };
}
