import { Navigate, Route, Routes } from "react-router-dom";
import { RequireAuth } from "./auth/RequireAuth";
import { InboxShell } from "./pages/InboxShell";
import { LoginPage } from "./pages/LoginPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<InboxShell />}>
          <Route index element={<Navigate to="/inbox" replace />} />
          <Route path="/inbox" element={null} />
          <Route path="/unread" element={null} />
          <Route path="/important" element={null} />
          <Route path="/archived" element={null} />
          <Route path="/settings" element={null} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/inbox" replace />} />
    </Routes>
  );
}
