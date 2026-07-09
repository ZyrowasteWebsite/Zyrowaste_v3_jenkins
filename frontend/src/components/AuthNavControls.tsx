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
        className="text-xs sm:text-sm font-semibold text-swaroop-700 hover:text-swaroop-900"
      >
        Sign out
      </button>
    );
  }

  return (
    <span className="flex items-center gap-2 sm:gap-3">
      <a href="#/signin" className="text-xs sm:text-sm font-medium hover:text-swaroop-700 transition">
        Sign in
      </a>
      <a
        href="#/signup"
        className="text-xs sm:text-sm font-semibold text-white bg-swaroop-600 hover:bg-swaroop-700 px-2.5 py-1 rounded-md transition"
      >
        Sign up
      </a>
    </span>
  );
}
