import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const teacherId = url.searchParams.get("teacherId");

    const where = teacherId ? { teacherId } : undefined;

    const exams = await prisma.examPaper.findMany({
      where,
      include: { questions: true },
      orderBy: { createdAt: "desc" }
    });

    return Response.json(exams);
  } catch (error: any) {
    return Response.json(
      { error: "Database connection failed", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      subject,
      difficulty,
      teacherId,
      questions,
      description,
      timeLimit
    } = body;

    if (!title || !subject || !difficulty || !teacherId || !Array.isArray(questions)) {
      return Response.json(
        { error: "Missing required exam fields." },
        { status: 400 }
      );
    }

    const exam = await prisma.examPaper.create({
      data: {
        title,
        subject,
        difficulty,
        teacherId,
        description,
        timeLimit: Number(timeLimit) || 0,
        questions: {
          create: questions.map((question: any) => ({
            type: question.type,
            questionText: question.questionText,
            answerKey: question.answerKey,
            marks: Number(question.marks || 1),
            options: question.options ?? null
          }))
        }
      },
      include: { questions: true }
    });

    return Response.json({ success: true, exam });
  } catch (error: any) {
    return Response.json(
      { error: error.message ?? "Failed to save exam." },
      { status: 500 }
    );
  }
}