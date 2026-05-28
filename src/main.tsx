import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App";
import { bootstrapApp } from "./app/bootstrap";
import { AppProviders } from "./app/providers/AppProviders";
import { AutomatedClientGuard } from "./app/security/AutomatedClientGuard";
import "./styles/index.css";

bootstrapApp();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AutomatedClientGuard>
      <BrowserRouter>
        <AppProviders>
          <App />
        </AppProviders>
      </BrowserRouter>
    </AutomatedClientGuard>
  </StrictMode>,
);
