import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

/** Shared Vite / Vitest resolve aliases — keep tsconfig `paths` in sync. */
export function createAliases(): Record<string, string> {
  return {
    "@": path.join(root, "src"),
    "@tests": path.join(root, "tests"),
    "@security/headers": path.join(root, "security-headers.ts"),
  };
}

export const projectRoot = root;
