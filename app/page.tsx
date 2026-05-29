import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-12">
      <section className="mx-auto flex max-w-6xl flex-col gap-10 rounded-3xl border border-slate-800 bg-slate-900/90 p-10 shadow-2xl shadow-black/20">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-400/80">SmartExam AI</p>
          <h1 className="text-4xl font-semibold text-white">Intelligent Exam Management for University Teaching</h1>
          <p className="max-w-2xl text-slate-300">
            Generate AI-assisted question papers, run student mock tests, manage results, and present a polished final project demo.
          </p>
          <div className="inline-flex items-center gap-3 rounded-full bg-slate-950/80 px-4 py-2 text-sm text-slate-200 shadow-xl shadow-slate-950/40">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Live demo ready for university coursework
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Link className="rounded-2xl border border-slate-700 bg-sky-500/15 px-6 py-5 text-center transition hover:bg-sky-500/25" href="/login">
            <h2 className="mb-2 text-xl font-semibold text-white">Login</h2>
            <p className="text-slate-300">Access your dashboard and student workflow.</p>
          </Link>

          <Link className="rounded-2xl border border-slate-700 bg-emerald-500/15 px-6 py-5 text-center transition hover:bg-emerald-500/25" href="/register">
            <h2 className="mb-2 text-xl font-semibold text-white">Register</h2>
            <p className="text-slate-300">Create a teacher, student, or admin account.</p>
          </Link>

          <Link className="rounded-2xl border border-slate-700 bg-violet-500/15 px-6 py-5 text-center transition hover:bg-violet-500/25" href="/dashboard">
            <h2 className="mb-2 text-xl font-semibold text-white">Dashboard</h2>
            <p className="text-slate-300">Jump straight to the SmartExam workspace.</p>
          </Link>
        </div>
      </section>
    </main>
  );
}
