const aiApiKey =
  process.env.OPENAI_API_KEY ||
  process.env.GEMINI_API_KEY ||
  process.env.OPENROUTER_API_KEY;
const isOpenAI = Boolean(process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY);

export async function generateExam(prompt: string) {
  if (!aiApiKey) {
    throw new Error(
      "Missing AI API key. Set OPENAI_API_KEY, GEMINI_API_KEY, or OPENROUTER_API_KEY in .env."
    );
  }

  const apiUrl = isOpenAI
    ? "https://api.openai.com/v1/chat/completions"
    : "https://openrouter.ai/api/v1/chat/completions";

  const model = process.env.GEMINI_API_KEY
    ? "gemini-1.5"
    : process.env.OPENAI_MODEL || "gpt-4o-mini";

  const body = isOpenAI
    ? {
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1200
      }
    : {
        model: "deepseek/deepseek-chat-v3-0324",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1200
      };

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${aiApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();

  if (!res.ok) {
    const message = data?.error?.message || data?.error || "AI API request failed.";
    throw new Error(message);
  }

  return data.choices?.[0]?.message?.content || "";
}

export function parseExamResponse(text: string) {
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const jsonMatch = cleaned.match(/\{[\s\S]*\}$/);
  const payload = jsonMatch ? jsonMatch[0] : cleaned;

  try {
    const parsed = JSON.parse(payload);
    return parsed;
  } catch (error) {
    try {
      const relaxed = payload
        .replace(/\n/g, " ")
        .replace(/\s+/g, " ")
        .replace(/,\s*}/g, "}")
        .replace(/,\s*]/g, "]");
      return JSON.parse(relaxed);
    } catch (innerError) {
      return {
        title: "Generated Exam",
        mcqs: [],
        shortQuestions: [],
        longQuestions: []
      };
    }
  }
}