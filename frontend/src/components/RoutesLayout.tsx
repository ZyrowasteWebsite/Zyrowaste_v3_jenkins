import { useState } from "react";
import { AuthNavControls } from "./AuthNavControls";
import { BrandMark } from "./BrandMark";
import ChatBot from "./ChatBot";

import EntryPage from "../pages/EntryPage";
import LandingPage from "../pages/LandingPage";
import AnalyticsPage from "../pages/AnalyticsPage";
import CertificationsPage from "../pages/CertificationsPage";
import ContactPage from "../pages/ContactPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import SignInPage from "../pages/SignInPage";
import SignUpPage from "../pages/SignUpPage";
import SubsidiariesPage from "../pages/SubsidiariesPage";
import ProductCataloguePage from "../pages/ProductCataloguePage";

/* ---------------- ROUTE NORMALIZER ---------------- */
export function normalizeHashRoute(): string {
  const raw = window.location.hash.replace(/^#/, "") || "/";
  const path = raw.split("?")[0];
  if (!path.startsWith("/")) {
    return `/${path}`;
  }
  return path;
}

/* ---------------- NAV LINKS ---------------- */
const NAV_LINKS = [
  { label: "Home", href: "#/landing" },
  { label: "Products", href: "#/products" },
  { label: "Certifications", href: "#/certifications" },
  { label: "Subsidiaries", href: "#/subsidiaries" },
  { label: "Contact", href: "#/contact" },
  { label: "Analytics", href: "#/analytics" },
];

/* ---------------- UNIFIED NAVBAR ---------------- */
export function AppNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-green-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-0">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#/landing" className="flex-shrink-0 flex items-center gap-2">
            <BrandMark size="sm" />
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-green-100 hover:text-white hover:bg-green-700 rounded-md transition-colors duration-150"
              >
                {link.label}
              </a>
            ))}
            <div className="ml-3 pl-3 border-l border-green-600">
              <AuthNavControls />
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden p-2 rounded-md text-green-100 hover:text-white hover:bg-green-700 transition"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-green-900 border-t border-green-700 px-4 py-3 space-y-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block px-3 py-2 text-sm font-medium text-green-100 hover:text-white hover:bg-green-700 rounded-md transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2 border-t border-green-700">
            <AuthNavControls />
          </div>
        </div>
      )}
    </nav>
  );
}

/* ---------------- ROUTES ---------------- */
type RoutesLayoutProps = { route: string };

export function RoutesLayout({ route }: RoutesLayoutProps) {
  const page =
    route === "/" ? (
      <EntryPage />
    ) : route === "/landing" ? (
      <LandingPage />
    ) : route === "/certifications" ? (
      <CertificationsPage />
    ) : route === "/analytics" ? (
      <AnalyticsPage />
    ) : route === "/subsidiaries" ? (
      <SubsidiariesPage />
    ) : route === "/contact" || route === "/contact-email" ? (
      <ContactPage />
    ) : route === "/products" ? (
      <ProductCataloguePage />
    ) : route === "/signin" ? (
      <SignInPage />
    ) : route === "/signup" ? (
      <SignUpPage />
    ) : route === "/forgot-password" ? (
      <ForgotPasswordPage />
    ) : route === "/reset-password" ? (
      <ResetPasswordPage />
    ) : (
      <EntryPage />
    );

  return (
    <>
      {route !== "/" && <AppNav />}
      {page}
      <ChatBot />
    </>
  );
}
