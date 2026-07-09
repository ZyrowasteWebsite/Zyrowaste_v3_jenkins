import { FormEvent, useState } from "react";
import { BRAND_NAME, LEGAL_ENTITY } from "../constants/brand";
import { apiSignup, saveToken } from "../utils/authApi";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const { access_token } = await apiSignup({ email, mobile, password });
      saveToken(access_token);
      setDone(true);
      window.location.hash = "#/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-52px)] bg-gradient-to-b from-swaroop-50/90 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-swaroop-100 rounded-2xl shadow-xl shadow-swaroop-100/40 p-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Create account</h1>
        <p className="text-sm text-gray-600 mt-1 mb-6">
          Join {BRAND_NAME} ({LEGAL_ENTITY}). Email and mobile are required.
        </p>

        {done ? (
          <p className="text-sm text-swaroop-700 font-medium">You are signed in. Redirecting…</p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block text-xs font-medium text-gray-700">
              Email <span className="text-red-600">*</span>
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
              Mobile (10 digits, India) <span className="text-red-600">*</span>
              <input
                type="tel"
                required
                autoComplete="tel"
                inputMode="numeric"
                placeholder="9876543210"
                value={mobile}
                onChange={(ev) => setMobile(ev.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-swaroop-500 focus:border-swaroop-500 outline-none"
              />
            </label>
            <label className="block text-xs font-medium text-gray-700">
              Password (min 8 characters) <span className="text-red-600">*</span>
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
              Confirm password <span className="text-red-600">*</span>
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

            <button
              type="submit"
              disabled={busy}
              className="w-full py-2.5 rounded-lg bg-swaroop-600 text-white font-semibold text-sm hover:bg-swaroop-700 disabled:opacity-60 transition"
            >
              {busy ? "Creating…" : "Sign up"}
            </button>
          </form>
        )}

        <p className="text-xs text-gray-500 mt-6 text-center">
          Already have an account?{" "}
          <a href="#/signin" className="font-semibold text-swaroop-700 hover:text-swaroop-800">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
