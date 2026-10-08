"use client";

import React, { useState } from "react";
import {
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle2,
  FolderGit2,
} from "lucide-react";
import { Issue, Difficulty } from "@/types";
import LaunchButton from "./LaunchButton";

interface IssueCardProps {
  issue: Issue;
}

export default function IssueCard({ issue }: IssueCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isBeginner =
    issue.difficulty === "BEGINNER" || issue.difficulty === "GOOD_FIRST_ISSUE";

  const difficultyBadgeClasses = isBeginner
    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    : "bg-amber-500/10 text-amber-400 border-amber-500/20";

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 hover:bg-slate-900/90 transition-all duration-200 shadow-sm hover:shadow-md">
      <div>
        {/* Repo & Difficulty Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <a
            href={`https://github.com/${issue.repoOwner}/${issue.repoName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-blue-400 transition-colors truncate max-w-[240px]"
          >
            <FolderGit2 className="w-3.5 h-3.5 shrink-0 text-slate-500" />
            <span>
              {issue.repoOwner}/{issue.repoName}
            </span>
          </a>

          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`px-2 py-0.5 text-[11px] font-semibold rounded-full border ${difficultyBadgeClasses}`}
            >
              {issue.difficulty.replace(/_/g, " ")}
            </span>
            <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-slate-800 border border-slate-700 text-slate-300">
              {issue.subfield.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        {/* Issue Title */}
        <h3 className="text-base font-semibold text-white leading-snug line-clamp-2 mb-2 group">
          <a
            href={issue.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-400 transition-colors"
          >
            {issue.title}
            <span className="text-slate-500 font-normal ml-1.5">
              #{issue.issueNumber}
            </span>
          </a>
        </h3>

        {/* Tags */}
        {issue.tags && issue.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {issue.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-[11px] rounded bg-slate-800/80 text-slate-400 border border-slate-800 font-mono"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Collapsible AI Summary & Action Plan Section */}
        <div className="rounded-lg border border-slate-800/80 bg-slate-950/50 p-3 mb-4">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>AI Triage & Action Plan</span>
            </span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* AI Summary Preview */}
          {issue.aiSummary && (
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              {issue.aiSummary}
            </p>
          )}

          {/* Expanded Action Plan */}
          {isExpanded && issue.aiActionPlan && issue.aiActionPlan.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Recommended 3-Step Plan
              </span>
              <ul className="space-y-1.5">
                {issue.aiActionPlan.map((step, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-xs text-slate-300"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
        <a
          href={issue.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <span>View on GitHub</span>
          <ExternalLink className="w-3 h-3" />
        </a>

        <LaunchButton
          repoOwner={issue.repoOwner}
          repoName={issue.repoName}
          issueId={issue.id}
        />
      </div>
    </div>
  );
}
