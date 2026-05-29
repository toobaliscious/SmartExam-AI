import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const studentId = url.searchParams.get("studentId");
  const teacherId = url.searchParams.get("teacherId");

  const where: any = {};
  if (studentId) where.studentId = studentId;
  if (teacherId) where.teacherId = teacherId;

  const results = await prisma.result.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      examPaper: { select: { title: true } },
      student: { select: { name: true } },
      teacher: { select: { name: true } }
    }
  });

  return Response.json(results);
}
