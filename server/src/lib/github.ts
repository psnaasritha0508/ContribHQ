import { z } from "zod";

const GITHUB_API_URL = "https://api.github.com";
const MAX_INGESTION_PAGES = 2; // Hard limit: max 2 pages (60 items max)
const PER_PAGE = 30;

export const GitHubIssueSchema = z.object({
  id: z.number(),
  number: z.number(),
  title: z.string(),
  body: z.string().nullable().optional(),
  html_url: z.string().url(),
  state: z.string(),
  labels: z.array(z.union([z.string(), z.object({ name: z.string() })])),
});

export type GitHubIssue = z.infer<typeof GitHubIssueSchema>;

export async function fetchGitHubIssues(
  owner: string,
  repo: string,
  token?: string
): Promise<GitHubIssue[]> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "ContribHQ-Ingestion",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const collected: GitHubIssue[] = [];

  for (let page = 1; page <= MAX_INGESTION_PAGES; page++) {
    const url = new URL(`${GITHUB_API_URL}/repos/${owner}/${repo}/issues`);
    url.searchParams.set("state", "open");
    url.searchParams.set("per_page", String(PER_PAGE));
    url.searchParams.set("page", String(page));

    const response = await fetch(url.toString(), {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const issues = z.array(GitHubIssueSchema).parse(data);
    collected.push(...issues);

    if (issues.length < PER_PAGE) {
      break;
    }
  }

  return collected;
}
