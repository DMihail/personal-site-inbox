import type { ReactNode } from "react";
import { useTelegramViewport } from "@/telegram/hooks";

interface TelegramProviderProps {
  children: ReactNode;
}

export function TelegramProvider({ children }: TelegramProviderProps) {
  useTelegramViewport();
  return children;
}
