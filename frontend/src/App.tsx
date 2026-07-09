import { useEffect, useState } from "react";
import { SplashScreen } from "./components/SplashScreen";
import { normalizeHashRoute, RoutesLayout } from "./components/RoutesLayout";

const SPLASH_MS = 500;

export default function App() {
  const [route, setRoute] = useState<string>(normalizeHashRoute);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const sync = () => setRoute(normalizeHashRoute());
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => setShowSplash(false), SPLASH_MS);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <>
      {showSplash ? <SplashScreen /> : null}
      <RoutesLayout route={route} />
    </>
  );
}
