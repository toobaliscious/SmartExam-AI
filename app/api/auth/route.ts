import { handlers } from "@/lib/auth";

export async function GET(req: Request) {
	// Forward to NextAuth handler
	// @ts-ignore - handlers may be dynamically provided by NextAuth
	return handlers.GET ? handlers.GET(req) : new Response(null, { status: 404 });
}

export async function POST(req: Request) {
	// Forward to NextAuth handler
	// @ts-ignore
	return handlers.POST ? handlers.POST(req) : new Response(null, { status: 404 });
}