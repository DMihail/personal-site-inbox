import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { RequireAuth } from "./auth/RequireAuth";

const LoginPage = lazy(() =>
  import("./pages/LoginPage").then((m) => ({ default: m.LoginPage })),
);
const InboxShell = lazy(() =>
  import("./pages/InboxShell").then((m) => ({ default: m.InboxShell })),
);
const TabletDrawerPreviewPage = import.meta.env.DEV
  ? lazy(() =>
      import("./pages/dev/TabletDrawerPreviewPage").then((m) => ({
        default: m.TabletDrawerPreviewPage,
      })),
    )
  : null;

function RouteFallback() {
  return (
    <div className="flex h-dvh items-center justify-center bg-background text-text-muted">
      Loading…
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {TabletDrawerPreviewPage ? (
          <Route path="/dev/tablet-drawer" element={<TabletDrawerPreviewPage />} />
        ) : null}
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
    </Suspense>
  );
}
