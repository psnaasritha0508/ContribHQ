export interface RawGitHubIssue {
  githubIssueId: bigint;
  repoOwner: string;
  repoName: string;
  issueNumber: number;
  title: string;
  body: string | null;
  issueUrl: string;
  githubUpdatedAt: Date;
}

const GITHUB_SEARCH_URL = "https://api.github.com/search/issues";
const MAX_PAGES = 2;
const PER_PAGE = 30;
const MAX_RETRIES = 3;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseRepoFromUrl(htmlUrl: string): { owner: string; repo: string } {
  try {
    const parts = new URL(htmlUrl).pathname.split("/").filter(Boolean);
    if (parts.length >= 2) {
      return { owner: parts[0], repo: parts[1] };
    }
  } catch {
    // fallback
  }
  return { owner: "unknown", repo: "unknown" };
}

export async function fetchGoodFirstIssues(): Promise<RawGitHubIssue[]> {
  const token = process.env.GITHUB_PAT || process.env.GITHUB_ACCESS_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "ContribHQ-App",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const results: RawGitHubIssue[] = [];

  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = new URL(GITHUB_SEARCH_URL);
    url.searchParams.set("q", "is:issue is:open label:good-first-issue,help-wanted");
    url.searchParams.set("sort", "updated");
    url.searchParams.set("order", "desc");
    url.searchParams.set("per_page", String(PER_PAGE));
    url.searchParams.set("page", String(page));

    let attempt = 0;
    let pageSuccess = false;

    while (attempt <= MAX_RETRIES && !pageSuccess) {
      attempt++;
      try {
        const response = await fetch(url.toString(), { method: "GET", headers });

        if (response.status === 403 || response.status === 429) {
          const retryAfterHeader = response.headers.get("retry-after");
          const waitTime = retryAfterHeader
            ? parseInt(retryAfterHeader, 10) * 1000
            : Math.pow(2, attempt) * 1000;
          console.warn(
            `[GitHubService] Rate limit response (${response.status}) on page ${page}. Retrying in ${waitTime}ms... (attempt ${attempt}/${MAX_RETRIES})`
          );
          await sleep(waitTime);
          continue;
        }

        if (!response.ok) {
          throw new Error(`GitHub Search API returned status ${response.status}: ${response.statusText}`);
        }

        const data = (await response.json()) as { items?: any[] };
        const items = data.items || [];

        for (const item of items) {
          const { owner, repo } = parseRepoFromUrl(item.html_url);
          results.push({
            githubIssueId: BigInt(item.id),
            repoOwner: owner,
            repoName: repo,
            issueNumber: item.number,
            title: item.title || "",
            body: item.body || null,
            issueUrl: item.html_url,
            githubUpdatedAt: new Date(item.updated_at || Date.now()),
          });
        }

        pageSuccess = true;
        if (items.length < PER_PAGE) {
          return results;
        }
      } catch (err) {
        if (attempt >= MAX_RETRIES) {
          console.error(`[GitHubService] Failed to fetch page ${page} after ${MAX_RETRIES} attempts:`, err);
          break;
        }
        await sleep(Math.pow(2, attempt) * 1000);
      }
    }
  }

  return results;
}
