import cron from "node-cron";
import dotenv from "dotenv";
import { prisma } from "../lib/prisma";
import { fetchGoodFirstIssues, RawGitHubIssue } from "./github.service";
import { enrichIssueWithAI } from "./gemini.service";

dotenv.config();

let isSyncRunning = false;

export async function runSyncOnce(): Promise<{ fetched: number; processed: number; skipped: number }> {
  if (isSyncRunning) {
    console.log("[SyncWorker] Sync is already running. Skipping concurrent run.");
    return { fetched: 0, processed: 0, skipped: 0 };
  }

  isSyncRunning = true;
  console.log(`[SyncWorker] Starting GitHub issue sync at ${new Date().toISOString()}...`);

  let processedCount = 0;
  let skippedCount = 0;

  try {
    const rawIssues: RawGitHubIssue[] = await fetchGoodFirstIssues();
    console.log(`[SyncWorker] Fetched ${rawIssues.length} issues from GitHub Search API.`);

    for (const raw of rawIssues) {
      try {
        const existing = await prisma.issue.findUnique({
          where: { githubIssueId: raw.githubIssueId },
          select: { id: true, githubUpdatedAt: true },
        });

        // Skip enrichment if unchanged
        if (existing && existing.githubUpdatedAt >= raw.githubUpdatedAt) {
          skippedCount++;
          continue;
        }

        // Enrich with Gemini 2.5 Flash
        const enrichment = await enrichIssueWithAI(raw.title, raw.body);

        await prisma.issue.upsert({
          where: { githubIssueId: raw.githubIssueId },
          update: {
            title: raw.title,
            body: raw.body,
            htmlUrl: raw.issueUrl,
            githubUpdatedAt: raw.githubUpdatedAt,
            subfield: enrichment.subField,
            difficulty: enrichment.difficulty,
            tags: enrichment.techStack,
            aiSummary: enrichment.aiSummary,
            aiActionPlan: enrichment.aiActionPlan,
            isOpen: true,
          },
          create: {
            githubIssueId: raw.githubIssueId,
            repoOwner: raw.repoOwner,
            repoName: raw.repoName,
            issueNumber: raw.issueNumber,
            title: raw.title,
            body: raw.body,
            htmlUrl: raw.issueUrl,
            githubUpdatedAt: raw.githubUpdatedAt,
            subfield: enrichment.subField,
            difficulty: enrichment.difficulty,
            tags: enrichment.techStack,
            aiSummary: enrichment.aiSummary,
            aiActionPlan: enrichment.aiActionPlan,
            isOpen: true,
          },
        });

        processedCount++;
      } catch (issueErr) {
        console.error(
          `[SyncWorker] Error processing issue #${raw.issueNumber} (${raw.repoOwner}/${raw.repoName}):`,
          issueErr
        );
      }
    }

    console.log(
      `[SyncWorker] Sync complete. Processed/Enriched: ${processedCount}, Skipped: ${skippedCount}, Total: ${rawIssues.length}`
    );
    return { fetched: rawIssues.length, processed: processedCount, skipped: skippedCount };
  } catch (err) {
    console.error("[SyncWorker] Fatal error during sync run:", err);
    return { fetched: 0, processed: processedCount, skipped: skippedCount };
  } finally {
    isSyncRunning = false;
  }
}

export function startSyncCron() {
  console.log("[SyncWorker] Scheduling sync cron job for every 30 minutes (*/30 * * * *)...");
  return cron.schedule("*/30 * * * *", async () => {
    console.log("[SyncWorker] Cron triggered scheduled issue sync...");
    await runSyncOnce();
  });
}

// Allow direct CLI invocation via `tsx src/services/sync.worker.ts`
if (require.main === module || process.argv[1]?.includes("sync.worker")) {
  runSyncOnce()
    .then(() => {
      console.log("[SyncWorker] Direct sync execution finished.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("[SyncWorker] Direct execution error:", err);
      process.exit(1);
    });
}
