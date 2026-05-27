import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  useLocation,
  matchPath,
} from "react-router-dom";
import { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { LandingPage } from "@/pages/landing-page";
import { LoginPage } from "@/pages/login-page";
import { SignUpPage } from "@/pages/signup-page";
import { HostLoginPage } from "@/pages/host-login-page";
import { EventsPage } from "@/pages/events-page";
import { DestinationsPage } from "@/pages/destinations-page";
import { EventDetailPage } from "@/pages/event-page";
import { AuthCallbackPage } from "@/pages/auth-callback-page";
import { ForgotPasswordPage } from "@/pages/forgot-password-page";
import { ResetPasswordPage } from "@/pages/reset-password-page";
import { ProfilePage } from "@/pages/profile-page";
import { HostUpgradePage } from "@/pages/host-upgrade-page";
import { HostDashboardLayout } from "@/pages/host-dashboard-page/HostDashboardLayout";
import { HostDashboardPage } from "@/pages/host-dashboard-page";
import { HostEventEditorPage } from "@/pages/host-event-editor-page";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { RequireHost } from "@/components/auth/RequireHost";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Title resolved by the longest matching pattern. Pages with dynamic titles
// (e.g. event detail) can override by calling useDocumentTitle themselves —
// their effect runs after this one.
const ROUTE_TITLES: Array<{ pattern: string; title: string | null }> = [
  { pattern: "/", title: null },
  { pattern: "/events", title: "Events" },
  { pattern: "/events/:id", title: "Event" },
  { pattern: "/destinations", title: "Destinations" },
  { pattern: "/profile", title: "Profile" },
  { pattern: "/login", title: "Log in" },
  { pattern: "/signup", title: "Sign up" },
  { pattern: "/host/login", title: "Host login" },
  { pattern: "/host/upgrade", title: "Become a host" },
  { pattern: "/host/dashboard", title: "Host dashboard" },
  { pattern: "/host/profile", title: "My profile" },
  { pattern: "/host/events/new", title: "New event" },
  { pattern: "/host/events/:id/edit", title: "Edit event" },
  { pattern: "/forgot-password", title: "Forgot password" },
  { pattern: "/auth/reset-password", title: "Reset password" },
  { pattern: "/auth/callback", title: "Signing in…" },
];

function RouteTitle() {
  const { pathname } = useLocation();
  const match = ROUTE_TITLES.find((r) =>
    matchPath({ path: r.pattern, end: true }, pathname),
  );
  useDocumentTitle(match ? match.title : null);
  return null;
}

function Layout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <RouteTitle />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/destinations" element={<DestinationsPage />} />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            }
          />
          <Route
            path="/host/upgrade"
            element={
              <RequireAuth>
                <HostUpgradePage />
              </RequireAuth>
            }
          />
        </Route>
        <Route
          element={
            <RequireHost>
              <HostDashboardLayout />
            </RequireHost>
          }
        >
          <Route path="/host/dashboard" element={<HostDashboardPage />} />
          <Route path="/host/profile" element={<ProfilePage />} />
          <Route path="/host/events/new" element={<HostEventEditorPage />} />
          <Route
            path="/host/events/:id/edit"
            element={<HostEventEditorPage />}
          />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/host/login" element={<HostLoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    </BrowserRouter>
  );
}
