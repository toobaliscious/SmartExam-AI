"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { calculateScore } from "@/lib/grading";

export default function MockTestPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    fetch("/api/exams")
      .then((res) => res.json())
      .then((data) => setExams(data || []));
  }, []);

  function selectAnswer(index: number, answer: string) {
    setAnswers((prev) => ({ ...prev, [String(index)]: answer }));
  }

  async function submitTest() {
    if (!selectedExam || !session?.user?.id) return;

    const score = calculateScore(answers, selectedExam.questions);
    const total = selectedExam.questions.reduce((sum: number, q: any) => sum + Number(q.marks || 1), 0);

    setResult({ score, total });
    setMessage("Saving result...");

    const response = await fetch("/api/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: session.user.id,
        teacherId: selectedExam.teacherId,
        examPaperId: selectedExam.id,
        totalMarks: total,
        obtainedMarks: score
      })
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Unable to save result.");
      return;
    }

    setMessage("Result saved successfully.");
  }

  if (status === "loading") {
    return <div className="min-h-screen bg-slate-950 text-white p-10">Loading mock test...</div>;
  }

  if (!selectedExam) {
    return (
      <div className="min-h-screen bg-slate-950 text-white px-6 py-10">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-xl shadow-slate-950/20">
          <h1 className="text-3xl font-semibold mb-4">Available Mock Tests</h1>
          <p className="text-slate-400 mb-6">Choose a saved exam and attempt a timed mock test.</p>

          {exams.length === 0 ? (
            <p className="text-slate-400">No exams available yet. Ask a teacher to create one.</p>
          ) : (
            <div className="space-y-4">
              {exams.map((exam) => (
                <div key={exam.id} className="rounded-3xl border border-slate-800 bg-slate-800 p-6">
                  <h2 className="text-xl font-semibold">{exam.title}</h2>
                  <p className="mt-1 text-slate-400">{exam.subject} • {exam.difficulty}</p>
                  <button
                    onClick={() => setSelectedExam(exam)}
                    className="mt-4 rounded-2xl bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400"
                  >
                    Start Test
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-xl shadow-slate-950/20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold">{selectedExam.title}</h1>
              <p className="mt-2 text-slate-400">Subject: {selectedExam.subject} • Difficulty: {selectedExam.difficulty}</p>
            </div>
            <button onClick={() => setSelectedExam(null)} className="rounded-2xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:border-slate-500">Back to exams</button>
          </div>
        </div>

        <div className="space-y-6">
          {selectedExam.questions.map((question: any, i: number) => (
            <div key={i} className="rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-xl shadow-slate-950/10">
              <p className="font-semibold text-white">Question {i + 1} ({question.type})</p>
              <p className="mt-3 text-slate-300">{question.questionText}</p>

              {question.options?.length > 0 && (
                <div className="mt-3 grid gap-2">
                  {question.options.map((option: string, optionIndex: number) => (
                    <button
                      key={optionIndex}
                      type="button"
                      onClick={() => selectAnswer(i, option)}
                      className={`rounded-2xl border px-4 py-3 text-left text-slate-200 transition ${answers[String(i)] === option ? "border-sky-500 bg-sky-500/10" : "border-slate-700 bg-slate-800 hover:border-slate-500"}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {!question.options?.length && (
                <textarea
                  value={answers[String(i)] || ""}
                  onChange={(e) => selectAnswer(i, e.target.value)}
                  rows={3}
                  className="mt-4 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
                  placeholder="Enter your answer"
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={submitTest}
            className="rounded-2xl bg-sky-500 px-6 py-3 font-semibold text-white transition hover:bg-sky-400"
          >
            Submit Test
          </button>
          {message && <p className="text-slate-300">{message}</p>}
        </div>

        {result && (
          <div className="rounded-3xl border border-slate-800 bg-emerald-950/20 p-6 text-emerald-200 shadow-xl shadow-emerald-500/10">
            <p className="text-xl font-semibold">Result</p>
            <p className="mt-2">Score: {result.score} / {result.total}</p>
          </div>
        )}
      </div>
    </div>
  );
}
