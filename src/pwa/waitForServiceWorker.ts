export const SERVICE_WORKER_TIMEOUT_MS = 20_000;

function workerScriptUrl(registration: ServiceWorkerRegistration): string {
  const worker = registration.active ?? registration.installing ?? registration.waiting;
  return worker?.scriptURL ?? "";
}

/** Rejects if `promise` does not settle within `timeoutMs`. */
export function promiseWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  message = "Operation timed out",
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(new Error(message));
    }, timeoutMs);

    void promise.then(
      (value) => {
        window.clearTimeout(timeoutId);
        resolve(value);
      },
      (error: unknown) => {
        window.clearTimeout(timeoutId);
        reject(error instanceof Error ? error : new Error(message));
      },
    );
  });
}

/** Resolves when `registration` has an active worker (or the page is already controlled). */
export function waitForServiceWorkerActive(
  registration: ServiceWorkerRegistration,
  timeoutMs = SERVICE_WORKER_TIMEOUT_MS,
): Promise<ServiceWorkerRegistration> {
  if (registration.active) {
    return Promise.resolve(registration);
  }

  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(new Error("Service worker activation timed out"));
    }, timeoutMs);

    const done = (reg: ServiceWorkerRegistration) => {
      window.clearTimeout(timeoutId);
      resolve(reg);
    };

    const fail = (message: string) => {
      window.clearTimeout(timeoutId);
      reject(new Error(message));
    };

    const worker = registration.installing ?? registration.waiting;
    if (worker) {
      const onStateChange = () => {
        if (registration.active || worker.state === "activated") {
          worker.removeEventListener("statechange", onStateChange);
          done(registration);
        } else if (worker.state === "redundant") {
          worker.removeEventListener("statechange", onStateChange);
          fail("Service worker failed to activate");
        }
      };

      worker.addEventListener("statechange", onStateChange);

      if (registration.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
      }

      if (worker.state === "activated" || registration.active) {
        worker.removeEventListener("statechange", onStateChange);
        done(registration);
      }
      return;
    }

    void navigator.serviceWorker.ready.then(done).catch(() => {
      fail("Service worker activation timed out");
    });
  });
}

export async function getActiveServiceWorkerRegistration(
  scope = "/",
  activationTimeoutMs = SERVICE_WORKER_TIMEOUT_MS,
): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;

  const existing = await navigator.serviceWorker.getRegistration(scope);
  if (existing?.active) {
    return existing;
  }

  if (existing) {
    try {
      return await waitForServiceWorkerActive(existing, activationTimeoutMs);
    } catch {
      return existing.active ? existing : null;
    }
  }

  // Do not await navigator.serviceWorker.ready with no registration — it never resolves.
  return null;
}

export function isMessagingServiceWorker(registration: ServiceWorkerRegistration): boolean {
  return workerScriptUrl(registration).includes("firebase-messaging-sw");
}

export function isWorkboxServiceWorker(registration: ServiceWorkerRegistration): boolean {
  const url = workerScriptUrl(registration);
  return /\/sw\.js(\?|$)/.test(url) || url.includes("workbox");
}

/** Unified `/sw.js` (preferred) or legacy standalone messaging SW during migration. */
export function isPushCapableServiceWorker(registration: ServiceWorkerRegistration): boolean {
  return isWorkboxServiceWorker(registration) || isMessagingServiceWorker(registration);
}
