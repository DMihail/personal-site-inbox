import { useMemo, type ReactNode } from "react";
import { BotBlockedScreen } from "../components/BotBlockedScreen";
import { isLikelyAutomatedClient } from "./automatedClient";

interface AutomatedClientGuardProps {
  children: ReactNode;
}

export function AutomatedClientGuard({ children }: AutomatedClientGuardProps) {
  const blocked = useMemo(() => isLikelyAutomatedClient(), []);

  if (blocked) {
    return <BotBlockedScreen />;
  }

  return children;
}
