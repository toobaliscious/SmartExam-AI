"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const defaultForm = {
  title: "AI Generated Paper",
  subject: "",
  topic: "",
  difficulty: "easy",
  style: "application-based",
  mcqCount: 4,
  shortCount: 3,
  longCount: 2,
  timeLimit: 45,
  content: ""
};

export default function ExamPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [form, setForm] = useState(defaultForm);
  const [generated, setGenerated] = useState<any>(null);
  const [savedExams, setSavedExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (!session?.user?.id) return;
    if (session.user.role === "TEACHER") {
      fetch(`/api/exams?teacherId=${session.user.id}`)
        .then((res) => res.json())
        .then((data) => setSavedExams(data || []));
    }
  }, [session]);

  const canGenerate = useMemo(() => session?.user?.role === "TEACHER", [session]);

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const response = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error || "AI generation failed.");
      return;
    }

    setGenerated(data.examData ?? null);
  }

  async function handleSaveExam() {
    if (!generated || !session?.user?.id) return;

    const questions = [
      ...(generated.mcqs || []).map((item: any) => ({
        type: "MCQ",
        questionText: item.questionText || item.prompt || "",
        answerKey: item.answerKey || "",
        marks: item.marks || 1,
        options: item.options || null
      })),
      ...(generated.shortQuestions || []).map((item: any) => ({
        type: "SHORT",
        questionText: item.questionText || item.prompt || "",
        answerKey: item.answerKey || "",
        marks: item.marks || 4,
        options: null
      })),
      ...(generated.longQuestions || []).map((item: any) => ({
        type: "LONG",
        questionText: item.questionText || item.prompt || "",
        answerKey: item.answerKey || "",
        marks: item.marks || 8,
        options: null
      }))
    ];

    const response = await fetch("/api/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: generated.title || form.title,
        subject: form.subject,
        difficulty: form.difficulty,
        teacherId: session.user.id,
        description: `${form.topic} — ${form.style}`,
        timeLimit: form.timeLimit,
        questions
      })
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Unable to save exam.");
      return;
    }

    setSavedExams((prev) => [data.exam, ...prev]);
    setMessage("Exam saved successfully.");
    setGenerated(null);
  }

  function downloadExam() {
    if (!generated) return;
    const blob = new Blob([JSON.stringify(generated, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${form.title.replace(/\W+/g, "-").toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (status === "loading") {
    return <div className="min-h-screen bg-slate-950 text-white p-10">Loading exam generator...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-xl shadow-slate-950/20">
          <h1 className="text-3xl font-semibold">AI Exam Generator</h1>
          <p className="mt-2 text-slate-400">Use AI to generate an exam paper, then save it as a structured question paper.</p>
        </div>

        {!canGenerate && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 text-slate-300 shadow-xl shadow-slate-950/20">
            <p className="text-xl">Only teachers can generate exam papers. Please login as a teacher account.</p>
          </div>
        )}

        {canGenerate && (
          <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
            <form onSubmit={handleGenerate} className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-xl shadow-slate-950/20">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm text-slate-300">Paper Title</span>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-slate-300">Subject</span>
                  <input
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
                    required
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm text-slate-300">Topic</span>
                  <input
                    value={form.topic}
                    onChange={(e) => setForm({ ...form, topic: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-slate-300">Exam Style</span>
                  <select
                    value={form.style}
                    onChange={(e) => setForm({ ...form, style: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
                  >
                    <option value="simple">Simple</option>
                    <option value="conceptual">Conceptual</option>
                    <option value="application-based">Application-based</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="text-sm text-slate-300">MCQs</span>
                  <input
                    type="number"
                    min={1}
                    value={form.mcqCount}
                    onChange={(e) => setForm({ ...form, mcqCount: Number(e.target.value) })}
                    className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-slate-300">Short Questions</span>
                  <input
                    type="number"
                    min={0}
                    value={form.shortCount}
                    onChange={(e) => setForm({ ...form, shortCount: Number(e.target.value) })}
                    className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-slate-300">Long Questions</span>
                  <input
                    type="number"
                    min={0}
                    value={form.longCount}
                    onChange={(e) => setForm({ ...form, longCount: Number(e.target.value) })}
                    className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm text-slate-300">Time Limit (minutes)</span>
                <input
                  type="number"
                  min={10}
                  value={form.timeLimit}
                  onChange={(e) => setForm({ ...form, timeLimit: Number(e.target.value) })}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
                />
              </label>

              <label className="block">
                <span className="text-sm text-slate-300">Source Material / Instructions (optional)</span>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={4}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
                />
              </label>

              {message && <p className="text-sm text-rose-400">{message}</p>}

              <button className="w-full rounded-2xl bg-sky-500 px-5 py-3 font-semibold transition hover:bg-sky-400" disabled={loading}>
                {loading ? "Generating exam..." : "Generate Exam"}
              </button>
            </form>

            <aside className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-xl shadow-slate-950/20">
              <h2 className="text-2xl font-semibold">Saved Papers</h2>
              <p className="text-slate-400">Your teacher-generated question papers are listed here.</p>

              {savedExams.length === 0 ? (
                <p className="text-slate-400">No saved papers yet.</p>
              ) : (
                <div className="space-y-3">
                  {savedExams.map((exam) => (
                    <div key={exam.id} className="rounded-3xl bg-slate-800 p-4">
                      <p className="font-semibold text-white">{exam.title}</p>
                      <p className="text-sm text-slate-400">{exam.subject}</p>
                      <p className="text-sm text-slate-400">{exam.questions.length} questions</p>
                    </div>
                  ))}
                </div>
              )}
            </aside>
          </div>
        )}

        {generated && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-xl shadow-slate-950/20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-semibold">Generated Exam Preview</h2>
              <div className="flex flex-wrap gap-3">
                <button onClick={handleSaveExam} className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold transition hover:bg-emerald-400">Save Paper</button>
                <button onClick={downloadExam} className="rounded-2xl border border-slate-700 px-4 py-2 text-sm transition hover:border-slate-500">Download JSON</button>
              </div>
            </div>

            <div className="mt-8 space-y-8">
              {generated.mcqs?.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold">MCQs</h3>
                  <ol className="mt-4 space-y-4">
                    {generated.mcqs.map((question: any, index: number) => (
                      <li key={index} className="rounded-3xl bg-slate-800 p-5">
                        <p className="font-semibold">{question.questionText}</p>
                        {question.options?.length > 0 && (
                          <ul className="mt-2 space-y-2 text-slate-300">
                            {question.options.map((option: string, optionIndex: number) => (
                              <li key={optionIndex}>{option}</li>
                            ))}
                          </ul>
                        )}
                        <p className="mt-3 text-sm text-slate-400">Answer: {question.answerKey}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {generated.shortQuestions?.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold">Short Questions</h3>
                  <ol className="mt-4 list-decimal space-y-4 pl-5 text-slate-300">
                    {generated.shortQuestions.map((question: any, index: number) => (
                      <li key={index} className="rounded-3xl bg-slate-800 p-5">
                        <p>{question.questionText}</p>
                        <p className="mt-2 text-sm text-slate-400">Answer: {question.answerKey}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {generated.longQuestions?.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold">Long Questions</h3>
                  <ol className="mt-4 list-decimal space-y-4 pl-5 text-slate-300">
                    {generated.longQuestions.map((question: any, index: number) => (
                      <li key={index} className="rounded-3xl bg-slate-800 p-5">
                        <p>{question.questionText}</p>
                        <p className="mt-2 text-sm text-slate-400">Answer: {question.answerKey}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
