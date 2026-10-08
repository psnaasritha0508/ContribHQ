"use client";

import React from "react";
import { Search, X } from "lucide-react";
import { SubField, Difficulty } from "@/types";

interface StackFilterProps {
  selectedSubField: string;
  onSelectSubField: (subField: string) => void;
  selectedTech: string;
  onSelectTech: (tech: string) => void;
  selectedDifficulty: string;
  onSelectDifficulty: (difficulty: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  techOptions: string[];
}

const SUB_FIELDS: { label: string; value: string }[] = [
  { label: "ALL", value: "ALL" },
  { label: "Frontend UI", value: "FRONTEND_UI" },
  { label: "Backend API", value: "BACKEND_API" },
  { label: "Database", value: "DATABASE" },
  { label: "Docs", value: "DOCS" },
  { label: "DevOps / Config", value: "DEVOPS_CONFIG" },
  { label: "Testing", value: "TESTING" },
];

const DIFFICULTIES: { label: string; value: string }[] = [
  { label: "All Difficulties", value: "ALL" },
  { label: "Beginner", value: "BEGINNER" },
  { label: "Intermediate", value: "INTERMEDIATE" },
];

export default function StackFilter({
  selectedSubField,
  onSelectSubField,
  selectedTech,
  onSelectTech,
  selectedDifficulty,
  onSelectDifficulty,
  searchQuery,
  onSearchChange,
  techOptions,
}: StackFilterProps) {
  return (
    <div className="space-y-4 mb-8">
      {/* Search & Dropdown Filter Row */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by repository (e.g. facebook/react) or issue title..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tech Stack Select */}
        <div className="min-w-[180px]">
          <select
            value={selectedTech}
            onChange={(e) => onSelectTech(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">All Technologies</option>
            {techOptions.map((tech) => (
              <option key={tech} value={tech}>
                {tech}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty Select */}
        <div className="min-w-[170px]">
          <select
            value={selectedDifficulty}
            onChange={(e) => onSelectDifficulty(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {DIFFICULTIES.map((diff) => (
              <option key={diff.value} value={diff.value}>
                {diff.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SubField Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {SUB_FIELDS.map((field) => {
          const isActive = selectedSubField === field.value;
          return (
            <button
              key={field.value}
              type="button"
              onClick={() => onSelectSubField(field.value)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
              }`}
            >
              {field.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
