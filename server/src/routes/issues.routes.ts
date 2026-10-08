import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { SubField, Difficulty, Prisma } from "@prisma/client";

const router = Router();

// GET /api/issues/filters - Distinct filter values
router.get("/filters", async (_req: Request, res: Response) => {
  try {
    const issues = await prisma.issue.findMany({
      where: { isOpen: true },
      select: {
        subfield: true,
        difficulty: true,
        tags: true,
      },
    });

    const subFieldsSet = new Set<string>();
    const difficultiesSet = new Set<string>();
    const techStacksSet = new Set<string>();

    for (const item of issues) {
      if (item.subfield) subFieldsSet.add(item.subfield);
      if (item.difficulty) difficultiesSet.add(item.difficulty);
      if (Array.isArray(item.tags)) {
        item.tags.forEach((tag) => techStacksSet.add(tag));
      }
    }

    res.json({
      subFields: Array.from(subFieldsSet).sort(),
      difficulties: Array.from(difficultiesSet).sort(),
      techStacks: Array.from(techStacksSet).sort(),
    });
  } catch (error) {
    console.error("[IssuesRouter] Error fetching filters:", error);
    res.status(500).json({ error: "Failed to fetch filters" });
  }
});

// GET /api/issues - Paginated and filtered issues
router.get("/", async (req: Request, res: Response) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);
    const skip = (page - 1) * limit;

    const { tech, subField, difficulty, search } = req.query;

    const where: Prisma.IssueWhereInput = {
      isOpen: true,
    };

    if (subField && typeof subField === "string" && subField in SubField) {
      where.subfield = subField as SubField;
    }

    if (difficulty && typeof difficulty === "string" && difficulty in Difficulty) {
      where.difficulty = difficulty as Difficulty;
    }

    if (tech && typeof tech === "string") {
      const techList = tech.split(",").map((t) => t.trim()).filter(Boolean);
      if (techList.length > 0) {
        where.tags = {
          hasSome: techList,
        };
      }
    }

    if (search && typeof search === "string" && search.trim().length > 0) {
      const searchTerms = search.trim();
      where.OR = [
        { title: { contains: searchTerms, mode: "insensitive" } },
        { repoName: { contains: searchTerms, mode: "insensitive" } },
      ];
    }

    const [total, issues] = await Promise.all([
      prisma.issue.count({ where }),
      prisma.issue.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      issues,
      total,
      page,
      totalPages,
    });
  } catch (error) {
    console.error("[IssuesRouter] Error fetching issues:", error);
    res.status(500).json({ error: "Failed to fetch issues" });
  }
});

export default router;
