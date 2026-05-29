"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ResultsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (!session?.user?.id) return;

    const params = new URLSearchParams();
    if (session.user.role === "STUDENT") params.set("studentId", session.user.id);
    if (session.user.role === "TEACHER") params.set("teacherId", session.user.id);

    fetch(`/api/results/get?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setResults(data || []));
  }, [session]);

  if (status === "loading") {
    return <div className="min-h-screen bg-slate-950 text-white p-10">Loading results...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-10">
      <div className="mx-auto max-w-5xl rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-xl shadow-slate-950/20">
        <h1 className="text-3xl font-semibold mb-4">Your Results</h1>
        {results.length === 0 ? (
          <p className="text-slate-400">No results available yet.</p>
        ) : (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="rounded-3xl border border-slate-800 bg-slate-800 p-6">
                <p className="font-semibold text-white">Exam: {result.examPaper?.title || result.examPaperId}</p>
                <p className="mt-2 text-slate-300">Score: {result.obtainedMarks} / {result.totalMarks}</p>
                <p className="text-slate-300">Grade: {result.grade}</p>
                <p className="mt-2 text-sm text-slate-400">Student: {result.student?.name || result.studentId}</p>
                <p className="text-sm text-slate-400">Teacher: {result.teacher?.name || result.teacherId}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
