import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App";
import { AutomatedClientGuard } from "./app/security/AutomatedClientGuard";
import "./styles/index.css";
import { useAuthStore } from "./app/store/authStore";
import { registerMessagingServiceWorker } from "./app/push/fcm";
import { getPushEnvironmentStatus, logPushEnvironmentHint } from "./app/push/pushEnvironment";

useAuthStore.getState().startAuthListener();

if ("serviceWorker" in navigator) {
  void registerMessagingServiceWorker();
}

void getPushEnvironmentStatus().then(logPushEnvironmentHint);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AutomatedClientGuard>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AutomatedClientGuard>
  </StrictMode>,
);