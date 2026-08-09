import { DEFAULT_SERVICE_WORKER_TIMEOUT_MS } from "./runtime";

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
  timeoutMs = DEFAULT_SERVICE_WORKER_TIMEOUT_MS,
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
