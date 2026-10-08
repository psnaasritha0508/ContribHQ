"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";

export interface SessionWrapperProps {
  children: React.ReactNode;
}

export default function SessionWrapper({ children }: SessionWrapperProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
