import { FormEvent, useState } from "react";
import { BRAND_NAME } from "../constants/brand";
import { apiLogin, saveToken } from "../utils/authApi";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { access_token } = await apiLogin({ email, password });
      saveToken(access_token);
      window.location.hash = "#/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-52px)] bg-gradient-to-b from-swaroop-50/90 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-swaroop-100 rounded-2xl shadow-xl shadow-swaroop-100/40 p-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Sign in</h1>
        <p className="text-sm text-gray-600 mt-1 mb-6">Welcome back to {BRAND_NAME}.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block text-xs font-medium text-gray-700">
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-swaroop-500 focus:border-swaroop-500 outline-none"
            />
          </label>
          <label className="block text-xs font-medium text-gray-700">
            Password
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-swaroop-500 focus:border-swaroop-500 outline-none"
            />
          </label>

          {error ? (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-2.5 rounded-lg bg-swaroop-600 text-white font-semibold text-sm hover:bg-swaroop-700 disabled:opacity-60 transition"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="flex flex-col gap-2 mt-4 text-sm text-center">
          <a href="#/forgot-password" className="font-medium text-swaroop-700 hover:text-swaroop-800">
            Forgot password?
          </a>
          <a href="#/reset-password" className="text-xs text-gray-500 hover:text-swaroop-700">
            I have a reset link
          </a>
        </div>

        <p className="text-xs text-gray-500 mt-6 text-center">
          New here?{" "}
          <a href="#/signup" className="font-semibold text-swaroop-700 hover:text-swaroop-800">
            Create an account
          </a>
        </p>
      </div>
    </div>
  );
}
