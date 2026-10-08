import type { Metadata } from "next";
import SessionWrapper from "@/components/SessionWrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: "ContribHQ | AI-Powered Developer Onboarding",
  description: "Find issues, get instant AI guidance, and launch codespaces seamlessly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased font-sans selection:bg-blue-600 selection:text-white">
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  );
}
