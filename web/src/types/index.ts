export type ActivityStatus =
  | "SAVED"
  | "BOOKMARKED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "MERGED"
  | "COMPLETED"
  | "ABANDONED";

export type SubField =
  | "FRONTEND"
  | "BACKEND"
  | "FULLSTACK"
  | "DEVOPS"
  | "AI_ML"
  | "MOBILE"
  | "DOCS"
  | "FRONTEND_UI"
  | "BACKEND_API"
  | "DATABASE"
  | "DEVOPS_CONFIG"
  | "TESTING"
  | "OTHER";

export type Difficulty =
  | "GOOD_FIRST_ISSUE"
  | "BEGINNER"
  | "INTERMEDIATE"
  | "ADVANCED";

export interface User {
  id: string;
  githubId: string;
  username: string;
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  techStack: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Issue {
  id: string;
  githubIssueId: string | number;
  repoOwner: string;
  repoName: string;
  issueNumber: number;
  title: string;
  body?: string | null;
  htmlUrl: string;
  subfield: SubField;
  difficulty: Difficulty;
  aiSummary?: string | null;
  aiActionPlan: string[];
  tags: string[];
  isOpen: boolean;
  githubUpdatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  issueId: string;
  status: ActivityStatus;
  notes?: string | null;
  launchedAt?: string | null;
  issue?: Issue;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedIssuesResponse {
  issues: Issue[];
  total: number;
  page: number;
  totalPages: number;
}

export interface FiltersResponse {
  subFields: SubField[];
  difficulties: Difficulty[];
  techStacks: string[];
}

export interface FetchIssuesParams {
  page?: number;
  limit?: number;
  tech?: string;
  subField?: SubField | string;
  difficulty?: Difficulty | string;
  search?: string;
}
