"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import Navbar from "@/components/Navbar";
import LaunchButton from "@/components/LaunchButton";
import { fetchMyActivity, updateActivityStatus } from "@/lib/api";
import { UserActivity, ActivityStatus } from "@/types";
import {
  Github,
  FolderGit2,
  ExternalLink,
  CheckCircle2,
  Clock,
  Bookmark,
  ArrowRight,
  Sparkles,
  RotateCcw,
  Layers,
} from "lucide-react";

type TabType = "IN_PROGRESS" | "COMPLETED" | "SAVED";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("IN_PROGRESS");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadActivities = () => {
    if (!session) return;
    const token = (session as any).accessToken;
    setLoading(true);

    fetchMyActivity(token)
      .then((data) => {
        setActivities(data.activities || []);
      })
      .catch((err) => {
        console.error("Failed to fetch user activities:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (status === "authenticated") {
      loadActivities();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, session]);

  const handleStatusToggle = async (activity: UserActivity) => {
    if (!session) return;
    const token = (session as any).accessToken;
    setUpdatingId(activity.id);

    const nextStatus: ActivityStatus =
      activity.status === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED";

    try {
      const res = await updateActivityStatus(activity.id, nextStatus, token);
      if (res.success && res.activity) {
        setActivities((prev) =>
          prev.map((a) => (a.id === activity.id ? res.activity : a))
        );
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredActivities = activities.filter((act) => {
    if (activeTab === "IN_PROGRESS") {
      return act.status === "IN_PROGRESS";
    }
    if (activeTab === "COMPLETED") {
      return act.status === "COMPLETED" || act.status === "MERGED";
    }
    if (activeTab === "SAVED") {
      return act.status === "SAVED" || act.status === "BOOKMARKED";
    }
    return true;
  });

  const countByTab: Record<TabType, number> = {
    IN_PROGRESS: activities.filter((a) => a.status === "IN_PROGRESS").length,
    COMPLETED: activities.filter(
      (a) => a.status === "COMPLETED" || a.status === "MERGED"
    ).length,
    SAVED: activities.filter(
      (a) => a.status === "SAVED" || a.status === "BOOKMARKED"
    ).length,
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {status === "loading" ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Loading your profile and contributions...</p>
          </div>
        ) : status === "unauthenticated" ? (
          <div className="max-w-md mx-auto my-16 p-8 rounded-2xl border border-slate-800 bg-slate-900/40 text-center space-y-6 shadow-xl">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Github className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Sign in to ContribHQ</h2>
              <p className="text-sm text-slate-400">
                Track your active GitHub contributions, resume Codespaces sessions, and manage your onboarding journey.
              </p>
            </div>
            <button
              onClick={() => signIn("github")}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all"
            >
              <Github className="w-4 h-4" />
              <span>Continue with GitHub</span>
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Page Header */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Contribution Tracking</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                My Activity Dashboard
              </h1>
              <p className="text-sm sm:text-base text-slate-400">
                Manage your active open-source tasks, relaunch development environments, and track completed PRs.
              </p>
            </div>

            {/* Segmented Tabs */}
            <div className="flex border-b border-slate-800 gap-6">
              <button
                type="button"
                onClick={() => setActiveTab("IN_PROGRESS")}
                className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === "IN_PROGRESS"
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>In Progress</span>
                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-slate-800 text-slate-300 font-mono">
                  {countByTab.IN_PROGRESS}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("COMPLETED")}
                className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === "COMPLETED"
                    ? "border-emerald-500 text-emerald-400"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Completed</span>
                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-slate-800 text-slate-300 font-mono">
                  {countByTab.COMPLETED}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("SAVED")}
                className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === "SAVED"
                    ? "border-indigo-500 text-indigo-400"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>Saved</span>
                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-slate-800 text-slate-300 font-mono">
                  {countByTab.SAVED}
                </span>
              </button>
            </div>

            {/* Content List */}
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-32 rounded-xl border border-slate-800 bg-slate-900/40 p-5 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="py-20 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 space-y-4">
                <Layers className="w-12 h-12 text-slate-600 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-white">
                    No {activeTab.replace(/_/g, " ").toLowerCase()} activities
                  </h3>
                  <p className="text-sm text-slate-400 max-w-sm mx-auto">
                    Launch a task from the discovery board or bookmark issues to see them organized here.
                  </p>
                </div>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
                >
                  <span>Browse Issues</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredActivities.map((act) => {
                  const issue = act.issue;
                  if (!issue) return null;

                  const isBeginner =
                    issue.difficulty === "BEGINNER" ||
                    issue.difficulty === "GOOD_FIRST_ISSUE";

                  const launchedText = act.launchedAt
                    ? new Date(act.launchedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : null;

                  return (
                    <div
                      key={act.id}
                      className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
                    >
                      <div className="space-y-2 flex-1">
                        {/* Meta Tags */}
                        <div className="flex flex-wrap items-center gap-2">
                          <a
                            href={`https://github.com/${issue.repoOwner}/${issue.repoName}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-blue-400 transition-colors"
                          >
                            <FolderGit2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>
                              {issue.repoOwner}/{issue.repoName}
                            </span>
                          </a>

                          <span
                            className={`px-2 py-0.5 text-[11px] font-semibold rounded-full border ${
                              isBeginner
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            }`}
                          >
                            {issue.difficulty.replace(/_/g, " ")}
                          </span>

                          <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                            {issue.subfield.replace(/_/g, " ")}
                          </span>

                          {launchedText && (
                            <span className="text-[11px] text-slate-500 flex items-center gap-1 ml-auto md:ml-0">
                              <Clock className="w-3 h-3" />
                              <span>Launched {launchedText}</span>
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-base font-semibold text-white">
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

                        {/* Summary */}
                        {issue.aiSummary && (
                          <p className="text-xs text-slate-400 line-clamp-1">
                            {issue.aiSummary}
                          </p>
                        )}
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                        {/* Toggle Status Button */}
                        <button
                          type="button"
                          disabled={updatingId === act.id}
                          onClick={() => handleStatusToggle(act)}
                          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                            act.status === "COMPLETED"
                              ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                              : "bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30"
                          } disabled:opacity-50`}
                          title="Toggle Completion Status"
                        >
                          {act.status === "COMPLETED" ? (
                            <>
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Reopen</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                              <span>Mark Done</span>
                            </>
                          )}
                        </button>

                        {/* Launch Button */}
                        <LaunchButton
                          repoOwner={issue.repoOwner}
                          repoName={issue.repoName}
                          issueId={issue.id}
                        />

                        {/* Link */}
                        <a
                          href={issue.htmlUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
                          title="View on GitHub"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
