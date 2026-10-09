import {
  FetchIssuesParams,
  FiltersResponse,
  PaginatedIssuesResponse,
  UserActivity,
  ActivityStatus,
} from "@/types";

function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    // Client-side in browser: relative path routes via Vercel /api rewrites on same origin
    return "";
  }
  // Server-side (SSR / Server Components): internal service URL or public/fallback
  return (
    process.env.INTERNAL_SERVER_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000"
  );
}

function getAuthHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchIssues(
  params?: FetchIssuesParams
): Promise<PaginatedIssuesResponse> {
  const base = getBaseUrl();
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.tech) searchParams.set("tech", params.tech);
  if (params?.subField) searchParams.set("subField", params.subField);
  if (params?.difficulty) searchParams.set("difficulty", params.difficulty);
  if (params?.search) searchParams.set("search", params.search);

  const queryStr = searchParams.toString();
  const endpoint = `${base}/api/issues${queryStr ? `?${queryStr}` : ""}`;

  const res = await fetch(endpoint, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch issues: ${res.status} ${res.statusText}`);
  }

  const rawData = await res.json();
  const issues = Array.isArray(rawData) ? rawData : rawData.issues || rawData.data || [];
  const total = typeof rawData.total === "number" ? rawData.total : issues.length;
  const page = typeof rawData.page === "number" ? rawData.page : (params?.page || 1);
  const totalPages =
    typeof rawData.totalPages === "number"
      ? rawData.totalPages
      : Math.max(1, Math.ceil(total / (params?.limit || 12)));

  return {
    issues,
    total,
    page,
    totalPages,
  };
}

export async function fetchFilters(): Promise<FiltersResponse> {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/issues/filters`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch filters: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function launchCodespaceActivity(
  issueId: string,
  token?: string
): Promise<{ success: boolean; activity: UserActivity }> {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/activity/launch`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify({ issueId }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      errorBody.error || `Failed to launch activity: ${res.status}`
    );
  }

  return res.json();
}

export async function fetchMyActivity(
  token?: string
): Promise<{ activities: UserActivity[] }> {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/activity/me`, {
    method: "GET",
    headers: getAuthHeaders(token),
    cache: "no-store",
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      errorBody.error || `Failed to fetch activities: ${res.status}`
    );
  }

  return res.json();
}

export async function updateActivityStatus(
  activityId: string,
  status: ActivityStatus,
  token?: string
): Promise<{ success: boolean; activity: UserActivity }> {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/activity/${activityId}`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      errorBody.error || `Failed to update activity: ${res.status}`
    );
  }

  return res.json();
}
