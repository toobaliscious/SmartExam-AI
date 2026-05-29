import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

export const authOptions: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const email = credentials?.email?.toString().trim();
        const phone = credentials?.phone?.toString().trim();
        const password = credentials?.password?.toString().trim();

        if (!password || (!email && !phone)) {
          throw new Error("Use email or phone and password to sign in.");
        }

        const searchConditions: any[] = [];
        if (email) searchConditions.push({ email });
        if (phone) searchConditions.push({ phone });

        const user = await prisma.user.findFirst({
          where: { OR: searchConditions }
        });

        if (!user) {
          throw new Error("Invalid credentials.");
        }

        if (!user.isActive) {
          throw new Error("Account suspended. Contact admin.");
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
          throw new Error("Invalid credentials.");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone
        };
      }
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
          })
        ]
      : [])
  ],
  secret:
    process.env.NEXTAUTH_SECRET ||
    process.env.AUTH_SECRET ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    (process.env.NODE_ENV === "production" ? undefined : "development-secret"),
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = (user as any).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login"
  }
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);

