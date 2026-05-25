import { BrowserRouter, Routes, Route, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
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
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
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
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/destinations" element={<DestinationsPage />} />
          <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="/host/upgrade" element={<RequireAuth><HostUpgradePage /></RequireAuth>} />
        </Route>
        <Route element={<RequireHost><HostDashboardLayout /></RequireHost>}>
          <Route path="/host/dashboard" element={<HostDashboardPage />} />
          <Route path="/host/events/new" element={<HostEventEditorPage />} />
          <Route path="/host/events/:id/edit" element={<HostEventEditorPage />} />
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
