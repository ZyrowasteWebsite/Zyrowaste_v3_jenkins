import { FormEvent, useEffect, useState } from "react";
import { apiResetPassword } from "../utils/authApi";

function readTokenFromHash(): string {
  const raw = window.location.hash.replace(/^#/, "") || "/";
  const q = raw.split("?")[1];
  if (!q) {
    return "";
  }
  return new URLSearchParams(q).get("token")?.trim() ?? "";
}

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const sync = () => setToken(readTokenFromHash());
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!token) {
      setError("Missing token. Open the link from your email or paste the token in the field below.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const res = await apiResetPassword(token, password);
      setSuccess(res.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-52px)] bg-gradient-to-b from-swaroop-50/90 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-swaroop-100 rounded-2xl shadow-xl shadow-swaroop-100/40 p-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Reset password</h1>
        <p className="text-sm text-gray-600 mt-1 mb-6">
          Choose a new password. If you opened this page without a token in the URL, paste the token you received.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block text-xs font-medium text-gray-700">
            Reset token
            <input
              type="text"
              value={token}
              onChange={(ev) => setToken(ev.target.value)}
              placeholder="From email link or debug output"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-swaroop-500 focus:border-swaroop-500 outline-none"
            />
          </label>
          <label className="block text-xs font-medium text-gray-700">
            New password (min 8)
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-swaroop-500 focus:border-swaroop-500 outline-none"
            />
          </label>
          <label className="block text-xs font-medium text-gray-700">
            Confirm password
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirm}
              onChange={(ev) => setConfirm(ev.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-swaroop-500 focus:border-swaroop-500 outline-none"
            />
          </label>

          {error ? (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
          ) : null}
          {success ? (
            <p className="text-sm text-swaroop-800 bg-swaroop-50 border border-swaroop-100 rounded-lg px-3 py-2">
              {success}{" "}
              <a href="#/signin" className="font-semibold underline">
                Sign in
              </a>
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-2.5 rounded-lg bg-swaroop-600 text-white font-semibold text-sm hover:bg-swaroop-700 disabled:opacity-60 transition"
          >
            {busy ? "Updating…" : "Update password"}
          </button>
        </form>

        <p className="text-xs text-gray-500 mt-6 text-center">
          <a href="#/forgot-password" className="font-semibold text-swaroop-700 hover:text-swaroop-800">
            Request a new link
          </a>
        </p>
      </div>
    </div>
  );
}
