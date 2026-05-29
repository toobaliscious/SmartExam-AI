import { generateExam, parseExamResponse } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      subject,
      topic,
      difficulty,
      style,
      mcqCount,
      shortCount,
      longCount,
      timeLimit,
      content
    } = body;

    if (!subject || !topic || !difficulty || !style) {
      return Response.json(
        { error: "Subject, topic, difficulty, and exam style are required." },
        { status: 400 }
      );
    }

    const prompt = `Generate a clean exam paper in JSON format for a teacher.
Subject: ${subject}
Topic: ${topic}
Difficulty: ${difficulty}
Style: ${style}
Time limit: ${timeLimit || "45 minutes"}
Instruction: create ${mcqCount || 4} MCQs, ${shortCount || 3} short answer questions, and ${longCount || 2} long answer questions.
Include answer keys and mark values.
${content ? `Use the following source material: ${content}` : ""}
Return ONLY valid JSON with this structure:
{
  "title": "...",
  "mcqs": [{ "questionText": "...", "options": ["...", "...", "...", "..."], "answerKey": "A", "marks": 2 }],
  "shortQuestions": [{ "questionText": "...", "answerKey": "...", "marks": 4 }],
  "longQuestions": [{ "questionText": "...", "answerKey": "...", "marks": 8 }]
}
`;

    const responseText = await generateExam(prompt);
    const examData = parseExamResponse(responseText);

    return Response.json({ success: true, examData, raw: responseText });
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message ?? "AI generation failed." },
      { status: 500 }
    );
  }
}