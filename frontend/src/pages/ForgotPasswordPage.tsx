import { FormEvent, useState } from "react";
import { apiForgotPassword } from "../utils/authApi";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [debugToken, setDebugToken] = useState<string | null>(null);
  const [debugPath, setDebugPath] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setDebugToken(null);
    setDebugPath(null);
    setBusy(true);
    try {
      const res = await apiForgotPassword(email);
      setMessage(res.message);
      if (res.reset_token) {
        setDebugToken(res.reset_token);
      }
      if (res.reset_path) {
        setDebugPath(res.reset_path);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-52px)] bg-gradient-to-b from-swaroop-50/90 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-swaroop-100 rounded-2xl shadow-xl shadow-swaroop-100/40 p-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Forgot password</h1>
        <p className="text-sm text-gray-600 mt-1 mb-6">
          Enter your account email. If it exists, we prepare a one-time reset link. In production, that link is
          emailed to you; with <code className="text-xs bg-gray-100 px-1 rounded">AUTH_DEBUG_RETURN_RESET_TOKEN</code>{" "}
          enabled on the API, the token is shown below for local testing.
        </p>

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
          {error ? (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full py-2.5 rounded-lg bg-swaroop-600 text-white font-semibold text-sm hover:bg-swaroop-700 disabled:opacity-60 transition"
          >
            {busy ? "Sending…" : "Send reset instructions"}
          </button>
        </form>

        {message ? (
          <p className="text-sm text-gray-700 mt-4 bg-swaroop-50 border border-swaroop-100 rounded-lg px-3 py-2">
            {message}
          </p>
        ) : null}

        {debugToken ? (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950 space-y-2">
            <p className="font-semibold">Debug reset token (dev only)</p>
            <code className="block break-all text-[11px]">{debugToken}</code>
            {debugPath ? (
              <a
                href={`#${debugPath}`}
                className="inline-block font-semibold text-swaroop-800 hover:underline"
              >
                Open reset page →
              </a>
            ) : (
              <a
                href={`#/reset-password?token=${encodeURIComponent(debugToken)}`}
                className="inline-block font-semibold text-swaroop-800 hover:underline"
              >
                Open reset page →
              </a>
            )}
          </div>
        ) : null}

        <p className="text-xs text-gray-500 mt-6 text-center">
          <a href="#/signin" className="font-semibold text-swaroop-700 hover:text-swaroop-800">
            Back to sign in
          </a>
        </p>
      </div>
    </div>
  );
}
