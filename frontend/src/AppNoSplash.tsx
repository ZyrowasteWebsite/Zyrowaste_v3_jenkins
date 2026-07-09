import { useEffect, useState } from "react";
import { normalizeHashRoute, RoutesLayout } from "./components/RoutesLayout";

/**
 * Alternate entry: same routes and UI as `App.tsx` without the Zyrowaste splash.
 * To use it, set `main.tsx` to `import App from "./AppNoSplash"`.
 */
export default function AppNoSplash() {
  const [route, setRoute] = useState<string>(normalizeHashRoute);

  useEffect(() => {
    const sync = () => setRoute(normalizeHashRoute());
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  return <RoutesLayout route={route} />;
}
