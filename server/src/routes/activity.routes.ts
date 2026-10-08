import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware, AuthenticatedRequest } from "../middleware/auth.middleware";
import { ActivityStatus } from "@prisma/client";

const router = Router();

// Apply auth middleware to all activity routes
router.use(authMiddleware);

// POST /api/activity/launch - Launch an issue, sets status to IN_PROGRESS and updates launchedAt
router.post("/launch", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { issueId } = req.body;

    if (!issueId || typeof issueId !== "string") {
      return res.status(400).json({ error: "issueId is required" });
    }

    // Verify issue exists
    const issueExists = await prisma.issue.findUnique({
      where: { id: issueId },
      select: { id: true },
    });

    if (!issueExists) {
      return res.status(404).json({ error: "Issue not found" });
    }

    const activity = await prisma.userActivity.upsert({
      where: {
        userId_issueId: {
          userId,
          issueId,
        },
      },
      update: {
        status: ActivityStatus.IN_PROGRESS,
        launchedAt: new Date(),
      },
      create: {
        userId,
        issueId,
        status: ActivityStatus.IN_PROGRESS,
        launchedAt: new Date(),
      },
      include: {
        issue: true,
      },
    });

    res.json({ success: true, activity });
  } catch (error) {
    console.error("[ActivityRouter] Error launching activity:", error);
    res.status(500).json({ error: "Failed to launch activity" });
  }
});

// GET /api/activity/me - Retrieve current user's activities with issue data
router.get("/me", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const activities = await prisma.userActivity.findMany({
      where: { userId },
      include: {
        issue: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    res.json({ activities });
  } catch (error) {
    console.error("[ActivityRouter] Error fetching user activities:", error);
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});

// PATCH /api/activity/:activityId - Update activity status
router.patch("/:activityId", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { activityId } = req.params;
    const { status } = req.body;

    if (!status || typeof status !== "string") {
      return res.status(400).json({ error: "Valid status is required" });
    }

    const validStatuses: Record<string, ActivityStatus> = {
      SAVED: ActivityStatus.SAVED,
      BOOKMARKED: ActivityStatus.BOOKMARKED,
      IN_PROGRESS: ActivityStatus.IN_PROGRESS,
      COMPLETED: ActivityStatus.COMPLETED,
    };

    const targetStatus = validStatuses[status.toUpperCase()];
    if (!targetStatus) {
      return res.status(400).json({
        error: "Status must be one of: 'SAVED', 'IN_PROGRESS', 'COMPLETED'",
      });
    }

    // Verify activity exists and belongs to requesting user
    const existingActivity = await prisma.userActivity.findUnique({
      where: { id: activityId },
    });

    if (!existingActivity) {
      return res.status(404).json({ error: "Activity not found" });
    }

    if (existingActivity.userId !== userId) {
      return res.status(403).json({ error: "Forbidden: Activity does not belong to you" });
    }

    const updated = await prisma.userActivity.update({
      where: { id: activityId },
      data: { status: targetStatus },
      include: {
        issue: true,
      },
    });

    res.json({ success: true, activity: updated });
  } catch (error) {
    console.error("[ActivityRouter] Error updating activity:", error);
    res.status(500).json({ error: "Failed to update activity" });
  }
});

export default router;
