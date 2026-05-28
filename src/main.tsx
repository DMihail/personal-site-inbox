import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App";
import "./styles/index.css";
import { useAuthStore } from "./app/store/authStore";
import "./pwa/registerSW";

useAuthStore.getState().startAuthListener();

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);