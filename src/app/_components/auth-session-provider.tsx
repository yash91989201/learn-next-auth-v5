"use client";
import React from "react";
import { SessionProvider } from "next-auth/react";
// TYPES
import type { Session } from "next-auth/types";

export default function AuthSessionProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
