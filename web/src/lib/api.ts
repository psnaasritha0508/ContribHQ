import {
  FetchIssuesParams,
  FiltersResponse,
  PaginatedIssuesResponse,
  UserActivity,
  ActivityStatus,
} from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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
  const url = new URL(`${API_BASE_URL}/api/issues`);

  if (params?.page) url.searchParams.set("page", String(params.page));
  if (params?.limit) url.searchParams.set("limit", String(params.limit));
  if (params?.tech) url.searchParams.set("tech", params.tech);
  if (params?.subField) url.searchParams.set("subField", params.subField);
  if (params?.difficulty) url.searchParams.set("difficulty", params.difficulty);
  if (params?.search) url.searchParams.set("search", params.search);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch issues: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function fetchFilters(): Promise<FiltersResponse> {
  const res = await fetch(`${API_BASE_URL}/api/issues/filters`, {
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
  const res = await fetch(`${API_BASE_URL}/api/activity/launch`, {
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
  const res = await fetch(`${API_BASE_URL}/api/activity/me`, {
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
  const res = await fetch(`${API_BASE_URL}/api/activity/${activityId}`, {
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
