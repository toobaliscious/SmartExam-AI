"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { signOut, useSession } from "next-auth/react";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<any[]>([]);
  const [examCount, setExamCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [message, setMessage] = useState("");
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "STUDENT" });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (!session) return;

    if (session.user?.role === "ADMIN") {
      fetch("/api/users")
        .then((res) => res.json())
        .then((data) => {
          setUsers(data || []);
          setUserCount(data?.length || 0);
        });
    }

    if (session.user?.role === "TEACHER") {
      fetch(`/api/exams?teacherId=${session.user.id}`)
        .then((res) => res.json())
        .then((data) => setExamCount(data?.length || 0));
    }
  }, [session]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const displayName = useMemo(() => {
    const rawName = session?.user?.name?.trim() || "SmartExam User";
    const parts = rawName.split(" ");
    if (/^(Mr|Mrs|Miss|Ms|Dr)$/i.test(parts[0])) {
      return `${parts[0]} ${parts[1] ?? ""}`.trim();
    }
    return parts[0];
  }, [session?.user?.name]);

  const role = session?.user?.role || "USER";

  async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser)
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Unable to create user.");
      return;
    }

    setMessage("User created successfully.");
    setNewUser({ name: "", email: "", password: "", role: "STUDENT" });
    setUsers((prev) => [data.user, ...prev]);
    setUserCount((count) => count + 1);
  }

  if (status === "loading") {
    return <div className="min-h-screen bg-slate-950 text-white p-10">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10">
        <header className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-xl shadow-slate-950/30 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-400/80">{role} Dashboard</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">{greeting}, {displayName}</h1>
            <p className="mt-2 text-slate-400">Welcome to your SmartExam AI workspace.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/exam" className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400">
              Go to Exam Generator
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded-2xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm text-slate-200 transition hover:border-slate-500"
            >
              Logout
            </button>
          </div>
        </header>

        {role === "ADMIN" && (
          <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-xl shadow-slate-950/20">
              <h2 className="text-2xl font-semibold text-white">Admin Control Center</h2>
              <p className="mt-2 text-slate-400">Create users, monitor system usage, and manage the SmartExam team.</p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-800 p-6">
                  <p className="text-sm text-slate-400">Total Users</p>
                  <p className="mt-3 text-4xl font-semibold text-sky-400">{userCount}</p>
                </div>
                <div className="rounded-3xl bg-slate-800 p-6">
                  <p className="text-sm text-slate-400">Teacher Exams</p>
                  <p className="mt-3 text-4xl font-semibold text-emerald-400">{examCount}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-xl shadow-slate-950/20">
              <h3 className="text-xl font-semibold text-white">Create Teacher or Student</h3>
              <form onSubmit={handleCreateUser} className="mt-6 space-y-4">
                <input
                  value={newUser.name}
                  onChange={(event) => setNewUser({ ...newUser, name: event.target.value })}
                  placeholder="Full Name"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
                  required
                />
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(event) => setNewUser({ ...newUser, email: event.target.value })}
                  placeholder="Email"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
                  required
                />
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(event) => setNewUser({ ...newUser, password: event.target.value })}
                  placeholder="Password"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
                  required
                />
                <select
                  value={newUser.role}
                  onChange={(event) => setNewUser({ ...newUser, role: event.target.value })}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
                >
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                </select>
                <button className="w-full rounded-2xl bg-emerald-500 px-4 py-3 font-semibold transition hover:bg-emerald-400">Create Account</button>
                {message && <p className="text-sm text-slate-300">{message}</p>}
              </form>
            </div>
          </section>
        )}

        {role === "TEACHER" && (
          <section className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-xl shadow-slate-950/20">
              <h2 className="text-2xl font-semibold text-white">Teacher Workspace</h2>
              <p className="mt-2 text-slate-400">Generate question papers, review student submissions, and organize your lessons.</p>

              <div className="mt-8 space-y-4">
                <div className="rounded-3xl bg-slate-800 p-6">
                  <p className="text-sm text-slate-400">My papers</p>
                  <p className="mt-3 text-4xl font-semibold text-sky-400">{examCount}</p>
                </div>
                <Link href="/exam" className="inline-flex rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-white hover:bg-sky-400">Generate Exam</Link>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-xl shadow-slate-950/20">
              <h2 className="text-2xl font-semibold text-white">Quick Actions</h2>
              <ul className="mt-6 space-y-3 text-slate-300">
                <li>• Create AI-assisted exams</li>
                <li>• Save question papers to your library</li>
                <li>• Share results with students</li>
              </ul>
            </div>
          </section>
        )}

        {role === "STUDENT" && (
          <section className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-xl shadow-slate-950/20">
              <h2 className="text-2xl font-semibold text-white">Student Learning</h2>
              <p className="mt-2 text-slate-400">Take timed mock tests, view your results, and improve your exam readiness.</p>

              <div className="mt-8 space-y-4">
                <Link href="/mock-test" className="inline-flex rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-white hover:bg-emerald-400">Start a Mock Test</Link>
                <Link href="/result" className="inline-flex rounded-2xl border border-slate-700 bg-slate-800 px-5 py-3 font-semibold text-slate-200 hover:border-slate-500">View Results</Link>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-xl shadow-slate-950/20">
              <h2 className="text-2xl font-semibold text-white">Progress</h2>
              <p className="mt-2 text-slate-400">Your latest scores and performance history are available in the results section.</p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
