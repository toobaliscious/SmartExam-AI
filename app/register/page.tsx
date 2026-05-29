"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password, role })
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Registration failed.");
      return;
    }

    router.push("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4 py-10">
      <form onSubmit={handleRegister} className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-xl shadow-slate-950/40">
        <h1 className="text-3xl font-semibold mb-6">Create your account</h1>
        <p className="mb-6 text-slate-400">Register as a student, teacher, or admin for your SmartExam demo.</p>

        <label className="block mb-4">
          <span className="text-sm text-slate-300">Full Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
            required
          />
        </label>

        <label className="block mb-4">
          <span className="text-sm text-slate-300">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
            required
          />
        </label>

        <label className="block mb-4">
          <span className="text-sm text-slate-300">Phone (optional)</span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
            placeholder="+1234567890"
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

        <label className="block mb-6">
          <span className="text-sm text-slate-300">Role</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
          >
            <option value="STUDENT">Student</option>
            <option value="TEACHER">Teacher</option>
            <option value="ADMIN">Admin</option>
          </select>
        </label>

        {error && <p className="mb-4 text-sm text-rose-400">{error}</p>}

        <button
          type="submit"
          className="w-full rounded-2xl bg-emerald-500 px-4 py-3 font-semibold transition hover:bg-emerald-400"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="mt-6 text-center text-slate-400">
          Already have an account? <Link className="text-sky-300 hover:text-sky-200" href="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
