import { prisma } from "@/lib/db";

export async function GET() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    },
    orderBy: { createdAt: "desc" }
  });

  return Response.json(users);
}
