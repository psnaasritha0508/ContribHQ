"use client";

import React from "react";
import { Terminal } from "lucide-react";
import { useSession } from "next-auth/react";
import { launchCodespaceActivity } from "@/lib/api";

interface LaunchButtonProps {
  repoOwner: string;
  repoName: string;
  issueId: string;
  className?: string;
}

export default function LaunchButton({
  repoOwner,
  repoName,
  issueId,
  className = "",
}: LaunchButtonProps) {
  const { data: session } = useSession();

  const handleLaunch = () => {
    // 1. Synchronously open Codespaces tab to prevent browser popup blockers
    const codespaceUrl = `https://github.com/codespaces/new?repo=${encodeURIComponent(
      repoOwner
    )}/${encodeURIComponent(repoName)}`;
    window.open(codespaceUrl, "_blank", "noopener,noreferrer");

    // 2. Fire optimistic background API call if authenticated
    if (session) {
      const token = (session as any).accessToken;
      launchCodespaceActivity(issueId, token).catch((err) => {
        console.warn("[LaunchButton] Background activity recording failed:", err);
      });
    }
  };

  return (
    <button
      onClick={handleLaunch}
      type="button"
      className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-semibold shadow-sm shadow-emerald-950 transition-all active:scale-95 ${className}`}
      title="Launch GitHub Codespace"
    >
      <Terminal className="w-4 h-4 text-emerald-200" />
      <span>Launch Codespace</span>
    </button>
  );
}
