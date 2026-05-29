export function compareAnswer(answer: string, correct: string) {
  if (!answer || !correct) return false;

  const clean = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

  return clean(answer) === clean(correct);
}

export function calculateScore(answers: Record<string, string>, questions: any[]) {
  return questions.reduce((total, question, index) => {
    const answer = answers[String(index)] || "";
    const correct = String(question.answerKey || "");
    return total + (compareAnswer(answer, correct) ? Number(question.marks || 1) : 0);
  }, 0);
}