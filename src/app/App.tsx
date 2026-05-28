import { Navigate, Route, Routes } from "react-router-dom";
import { RequireAuth } from "./auth/RequireAuth";
import { InboxShell } from "./pages/InboxShell";
import { LoginPage } from "./pages/LoginPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/" element={<Navigate to="/inbox" replace />} />
        <Route path="/inbox" element={<InboxShell />} />
        <Route path="/unread" element={<InboxShell />} />
        <Route path="/important" element={<InboxShell />} />
        <Route path="/archived" element={<InboxShell />} />
        <Route path="/settings" element={<InboxShell />} />
      </Route>
      <Route path="*" element={<Navigate to="/inbox" replace />} />
    </Routes>
  );
}
