import { AuthNavControls } from "./AuthNavControls";
import { BrandMark } from "./BrandMark";
import ChatBot from "./ChatBot";

import EntryPage from "../pages/EntryPage"; // 👈 NEW
import LandingPage from "../pages/LandingPage";

import AnalyticsPage from "../pages/AnalyticsPage";
import CertificationsPage from "../pages/CertificationsPage";
import ContactEmailPage from "../pages/ContactEmailPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import SignInPage from "../pages/SignInPage";
import SignUpPage from "../pages/SignUpPage";
import SubsidiariesPage from "../pages/SubsidiariesPage";

/* ---------------- ROUTE NORMALIZER ---------------- */
export function normalizeHashRoute(): string {
  const raw = window.location.hash.replace(/^#/, "") || "/";
  const path = raw.split("?")[0];

  if (!path.startsWith("/")) {
    return `/${path}`;
  }

  return path;
}

/* ---------------- NAVBAR ---------------- */
export function AppNav() {
  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-swaroop-100">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
        <BrandMark size="sm" />

        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm font-medium text-gray-600 flex-wrap justify-end">
          
          {/* 🔥 IMPORTANT FIX: Home should go to marketing page */}
          <a href="#/landing" className="hover:text-swaroop-700 transition">
            Home
          </a>

          <a href="#/subsidiaries" className="hover:text-swaroop-700 transition">
            Subsidiaries
          </a>

          <a href="#/certifications" className="hover:text-swaroop-700 transition">
            Certifications
          </a>

          <a href="#/contact-email" className="hover:text-swaroop-700 transition">
            Email
          </a>

          <a href="#/analytics" className="hover:text-swaroop-700 transition">
            Analytics
          </a>

          <span className="hidden sm:inline-block w-px h-4 bg-gray-200" />

          <AuthNavControls />
        </div>
      </div>
    </nav>
  );
}

/* ---------------- ROUTES ---------------- */
type RoutesLayoutProps = {
  route: string;
};

export function RoutesLayout({ route }: RoutesLayoutProps) {

  const page =
    route === "/" ? (
      <EntryPage /> // 🌿 FIRST PAGE (login screen)
    ) : route === "/landing" ? (
      <LandingPage /> // 📊 full website
    ) : route === "/certifications" ? (
      <CertificationsPage />
    ) : route === "/analytics" ? (
      <AnalyticsPage />
    ) : route === "/subsidiaries" ? (
      <SubsidiariesPage />
    ) : route === "/contact-email" ? (
      <ContactEmailPage />
    ) : route === "/signin" ? (
      <SignInPage />
    ) : route === "/signup" ? (
      <SignUpPage />
    ) : route === "/forgot-password" ? (
      <ForgotPasswordPage />
    ) : route === "/reset-password" ? (
      <ResetPasswordPage />
    ) : (
      <EntryPage /> // 👈 SAFE FALLBACK
    );

  return (
    <>
      {/* ❌ Hide navbar on EntryPage */}
      {route !== "/" && <AppNav />}

      {page}

      <ChatBot />
    </>
  );
}