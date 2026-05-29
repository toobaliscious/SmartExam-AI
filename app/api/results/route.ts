import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentId, examPaperId, totalMarks, obtainedMarks, teacherId } = body;

    if (!studentId || !examPaperId || totalMarks === undefined || obtainedMarks === undefined || !teacherId) {
      return Response.json(
        { error: "Missing grading information." },
        { status: 400 }
      );
    }

    const ratio = totalMarks > 0 ? obtainedMarks / totalMarks : 0;
    const grade = ratio >= 0.8 ? "A" : ratio >= 0.6 ? "B" : "C";

    const [result, attempt] = await prisma.$transaction([
      prisma.result.create({
        data: {
          studentId,
          teacherId,
          examPaperId,
          totalMarks,
          obtainedMarks,
          grade
        }
      }),
      prisma.mockTestAttempt.create({
        data: {
          studentId,
          examPaperId,
          score: Number(obtainedMarks)
        }
      })
    ]);

    return Response.json({ success: true, result, attempt });
  } catch (err: any) {
    return Response.json({ error: err.message ?? "Failed to save result." }, { status: 500 });
  }
}
