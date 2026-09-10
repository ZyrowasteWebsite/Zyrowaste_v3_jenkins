import { useCallback, useEffect, useState } from "react";
import { SplashScreen } from "./components/SplashScreen";
import { normalizeHashRoute, RoutesLayout } from "./components/RoutesLayout";

export default function App() {
  const [route, setRoute] = useState<string>(normalizeHashRoute);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const sync = () => setRoute(normalizeHashRoute());
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const dismissSplash = useCallback(() => setShowSplash(false), []);

  return (
    <>
      {showSplash ? <SplashScreen onComplete={dismissSplash} /> : null}
      <RoutesLayout route={route} />
    </>
  );
}
