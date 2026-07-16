import { useState, type ReactNode } from "react";
import { BotBlockedScreen } from "../components/BotBlockedScreen";
import { isLikelyAutomatedClient } from "./automatedClient";

interface AutomatedClientGuardProps {
  children: ReactNode;
}

export function AutomatedClientGuard({ children }: AutomatedClientGuardProps) {
  const [blocked] = useState(() => isLikelyAutomatedClient());

  if (blocked) {
    return <BotBlockedScreen />;
  }

  return children;
}
