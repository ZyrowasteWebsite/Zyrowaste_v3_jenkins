import { useState } from "react";
import { BRAND_NAME, BRAND_TAGLINE, BRAND_WEB } from "../constants/brand";
import fallbackLogo from "../assets/Zyrowaste_Updated.jpg";

/** Set to true to let the mark span most of the viewport (flat artwork works best). */
export const SPLASH_LOGO_FILL_SCREEN = false;

type SplashScreenProps = {
  /** Logo height as a fraction of viewport height (default ~1/3). Ignored when `SPLASH_LOGO_FILL_SCREEN` is true. */
  logoVhFraction?: number;
};

/**
 * Short intro: Zyrowaste branding, then the main app (same stack) loads.
 * Drop `public/zyrowaste-logo.png` for your circular mark; otherwise the bundled JPEG is used.
 */
export function SplashScreen({ logoVhFraction = 1 / 3 }: SplashScreenProps) {
  const vhPercent = Math.round(logoVhFraction * 100);
  const [useFallback, setUseFallback] = useState(false);
  const src = useFallback ? fallbackLogo : "/zyrowaste-logo.png";

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-white via-swaroop-50 to-emerald-50 px-6"
      role="presentation"
      aria-hidden="true"
    >
      <div className="splash-animate flex flex-col items-center gap-5 text-center max-w-lg">
        <div
          className={
            SPLASH_LOGO_FILL_SCREEN
              ? "flex items-center justify-center w-[min(92vw,720px)] max-h-[min(70vh,520px)]"
              : "flex items-center justify-center"
          }
          style={
            SPLASH_LOGO_FILL_SCREEN
              ? undefined
              : { height: `${vhPercent}vh`, maxHeight: "min(40vh, 360px)" }
          }
        >
          <div className="h-full aspect-square max-h-full rounded-full overflow-hidden ring-4 ring-swaroop-200 shadow-xl bg-swaroop-900">
            <img
              src={src}
              alt=""
              className="h-full w-full object-cover"
              onError={() => setUseFallback(true)}
              draggable={false}
            />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-extrabold tracking-tight text-swaroop-800">{BRAND_NAME}</p>
          <p className="text-xs font-semibold uppercase tracking-wide text-swaroop-600">{BRAND_TAGLINE}</p>
          <p className="text-sm text-gray-600">
            Biodegradable packaging ·{" "}
            <span className="font-medium text-swaroop-700">{BRAND_WEB}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
