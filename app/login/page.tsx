"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const googleEnabled = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await signIn("credentials", {
      redirect: false,
      email: email || undefined,
      phone: phone || undefined,
      password
    });

    setLoading(false);

    if (response?.error) {
      setError(response.error);
      return;
    }

    router.push("/dashboard");
  }

  function handleGoogleSignIn() {
    signIn("google", { callbackUrl: "/dashboard" });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4 py-10">
      <form onSubmit={handleLogin} className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-xl shadow-slate-950/40">
        <h1 className="text-3xl font-semibold mb-6">Welcome Back</h1>
        <p className="mb-6 text-slate-400">Login with your university account to continue.</p>

        <label className="block mb-4">
          <span className="text-sm text-slate-300">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
            placeholder="teacher@example.com"
          />
        </label>

        <label className="block mb-4">
          <span className="text-sm text-slate-300">Phone</span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
            placeholder="Optional phone login"
          />
        </label>

        <label className="block mb-4">
          <span className="text-sm text-slate-300">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
            required
          />
        </label>

        {error && <p className="text-sm text-rose-400 mb-4">{error}</p>}

        <button
          type="submit"
          className="w-full rounded-2xl bg-sky-500 px-4 py-3 font-semibold transition hover:bg-sky-400"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        {googleEnabled && (
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="mt-4 w-full rounded-2xl border border-slate-700 bg-white/10 px-4 py-3 text-white transition hover:bg-white/15"
          >
            Continue with Google
          </button>
        )}

        <p className="mt-6 text-center text-slate-400">
          Don&apos;t have an account? <Link className="text-sky-300 hover:text-sky-200" href="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}
