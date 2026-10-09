"use client";

import React, { useEffect, useState, useTransition } from "react";
import Navbar from "@/components/Navbar";
import StackFilter from "@/components/StackFilter";
import IssueCard from "@/components/IssueCard";
import { fetchFilters, fetchIssues } from "@/lib/api";
import { Issue } from "@/types";
import { ChevronLeft, ChevronRight, Inbox, Sparkles, RefreshCw } from "lucide-react";

export default function DiscoveryPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [subField, setSubField] = useState("ALL");
  const [tech, setTech] = useState("ALL");
  const [difficulty, setDifficulty] = useState("ALL");
  const [search, setSearch] = useState("");
  const [techOptions, setTechOptions] = useState<string[]>([]);

  // Load Filter Options Once
  useEffect(() => {
    fetchFilters()
      .then((data) => {
        if (data.techStacks) {
          setTechOptions(data.techStacks);
        }
      })
      .catch((err) => console.warn("Failed to load filter options:", err));
  }, []);

  // Fetch Issues on Filter/Page Change
  useEffect(() => {
    let active = true;
    setLoading(true);

    const queryParams: any = {
      page,
      limit: 12,
    };

    if (subField !== "ALL") queryParams.subField = subField;
    if (tech !== "ALL") queryParams.tech = tech;
    if (difficulty !== "ALL") queryParams.difficulty = difficulty;
    if (search.trim()) queryParams.search = search.trim();

    fetchIssues(queryParams)
      .then((data: any) => {
        if (active) {
          const items = Array.isArray(data) ? data : data?.issues || data?.data || [];
          setIssues(items);
          setTotal(typeof data?.total === "number" ? data.total : items.length);
          setTotalPages(data?.totalPages || 1);
        }
      })
      .catch((err) => {
        console.error("Failed to load issues:", err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, subField, tech, difficulty, search]);

  const handleSubFieldChange = (val: string) => {
    setSubField(val);
    setPage(1);
  };

  const handleTechChange = (val: string) => {
    setTech(val);
    setPage(1);
  };

  const handleDifficultyChange = (val: string) => {
    setDifficulty(val);
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Triage & 1-Click Codespaces</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Discover Open Source Tasks
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-3xl">
            Triage curated issues across top open-source projects, reviewed with Gemini 2.5 Flash for difficulty, summary, and action plan.
          </p>
        </div>

        {/* Filter Controls */}
        <StackFilter
          selectedSubField={subField}
          onSelectSubField={handleSubFieldChange}
          selectedTech={tech}
          onSelectTech={handleTechChange}
          selectedDifficulty={difficulty}
          onSelectDifficulty={handleDifficultyChange}
          searchQuery={search}
          onSearchChange={handleSearchChange}
          techOptions={techOptions}
        />

        {/* Issue Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-72 rounded-xl border border-slate-800 bg-slate-900/40 p-5 animate-pulse flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-4 bg-slate-800 rounded w-1/3" />
                  <div className="h-6 bg-slate-800 rounded w-4/5" />
                  <div className="h-16 bg-slate-800/60 rounded" />
                </div>
                <div className="h-8 bg-slate-800 rounded" />
              </div>
            ))}
          </div>
        ) : issues.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-dashed border-slate-800 bg-slate-900/20">
            <Inbox className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white">No issues found</h3>
            <p className="text-sm text-slate-400 mt-1">
              Try adjusting your search criteria, subfield filters, or difficulty level.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {issues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && totalPages > 1 && (
          <div className="mt-10 flex items-center justify-between border-t border-slate-800 pt-6">
            <span className="text-xs text-slate-400">
              Showing page <span className="font-semibold text-white">{page}</span> of{" "}
              <span className="font-semibold text-white">{totalPages}</span> ({total} total issues)
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-xs font-medium text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-xs font-medium text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 hover:text-white transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
