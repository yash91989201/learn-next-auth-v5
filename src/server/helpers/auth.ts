import NextAuth from "next-auth";

import { DrizzleAdapter } from "@auth/drizzle-adapter";
import type { DefaultSession } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

import Credentials from "next-auth/providers/credentials";

import { env } from "@/env";
import { db } from "@/server/db";
import { mysqlTable, twoFactorConfimation, users } from "@/server/db/schema";

import { LoginSchema } from "@/lib/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

import {
  getTwoFactorConfirmationByUserId,
  getUserByEmail,
  getUserById,
} from "@/server/helpers";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      isTwoFactorEnabled: boolean;
      emailVerified: boolean;
      // ...other properties
      role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
  update,
} = NextAuth({
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  events: {
    async linkAccount({ user }) {
      await db
        .update(users)
        .set({ emailVerified: new Date() })
        .where(eq(users.id, user.id));
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "credentials") return true;

      const existingUser = await getUserById(user.id);

      if (!existingUser?.emailVerified) {
        return false;
      }

      if (existingUser?.isTwoFactorEnabled) {
        const existing2FAConfirmation = await getTwoFactorConfirmationByUserId(
          existingUser.id,
        );
        console.log("existing2FAConfirmation");
        if (!existing2FAConfirmation) {
          return false;
        }

        await db
          .delete(twoFactorConfimation)
          .where(eq(twoFactorConfimation.id, existing2FAConfirmation.id));
      }

      return true;
    },
    async jwt({ token }) {
      if (!token.sub) return token;

      const existingUser = await getUserById(token.sub);
      if (!existingUser) return token;

      token.role = existingUser.role;
      token.emailVerified = existingUser.emailVerified;
      return token;
    },
    async session({ session, token }) {
      if (token.sub && session.user) session.user.id = token.sub;

      if (token.role && session.user) {
        session.user.role = token.role as UserRole;
        session.user.emailVerified = token.emailVerified as boolean;
      }

      return session;
    },
  },
  adapter: DrizzleAdapter(db, mysqlTable),
  providers: [
    GoogleProvider({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
    }),
    GithubProvider({
      clientId: env.AUTH_GITHUB_ID,
      clientSecret: env.AUTH_GITHUB_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);
        if (validatedFields.success) {
          const { email, password } = validatedFields.data;
          const user = await getUserByEmail(email);

          if (!user?.password || !user) return null;

          const isPasswordMatching = await bcrypt.compare(
            password,
            user.password,
          );
          if (isPasswordMatching) return user;
        }
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
});
