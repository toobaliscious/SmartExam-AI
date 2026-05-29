import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

const validRoles = ["ADMIN", "TEACHER", "STUDENT"] as const;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, role, phone } = body;
    const normalizedRole = typeof role === "string" ? role.toUpperCase() : "";

    if (!name || !email || !password || !validRoles.includes(normalizedRole as any)) {
      return Response.json(
        { success: false, error: "Name, email, password, and valid role are required." },
        { status: 400 }
      );
    }

    const existingEmail = await prisma.user.findUnique({
      where: { email }
    });

    if (existingEmail) {
      return Response.json(
        { success: false, error: "Email already registered." },
        { status: 409 }
      );
    }

    if (phone) {
      const existingPhone = await prisma.user.findUnique({
        where: { phone }
      });

      if (existingPhone) {
        return Response.json(
          { success: false, error: "Phone number already registered." },
          { status: 409 }
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone ? phone.toString().trim() : null,
        password: hashedPassword,
        role: normalizedRole as any,
        isActive: true
      }
    });

    return Response.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message ?? "Registration failed." },
      { status: 500 }
    );
  }
}
