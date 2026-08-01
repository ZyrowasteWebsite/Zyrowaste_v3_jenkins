import { useEffect, useState } from "react";
import { clearToken, getStoredToken } from "../utils/authApi";

export function AuthNavControls() {
  const [token, setToken] = useState<string | null>(() => getStoredToken());

  useEffect(() => {
    const sync = () => setToken(getStoredToken());
    window.addEventListener("zyrowaste-auth-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("zyrowaste-auth-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  if (token) {
    return (
      <button
        type="button"
        onClick={() => clearToken()}
        className="text-sm font-semibold text-green-100 hover:text-white hover:bg-green-700 px-3 py-2 rounded-md transition-colors"
      >
        Sign out
      </button>
    );
  }

  return (
    <span className="flex items-center gap-2">
      <a
        href="#/signin"
        className="text-sm font-medium text-green-100 hover:text-white hover:bg-green-700 px-3 py-2 rounded-md transition-colors"
      >
        Sign in
      </a>
      <a
        href="#/signup"
        className="text-sm font-semibold text-green-800 bg-white hover:bg-green-50 px-3 py-2 rounded-md transition-colors"
      >
        Sign up
      </a>
    </span>
  );
}
