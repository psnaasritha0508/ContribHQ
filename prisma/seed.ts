import { PrismaClient, SubField, Difficulty, ActivityStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  // Clean existing seed/demo data
  await prisma.userActivity.deleteMany({});
  await prisma.issue.deleteMany({});
  await prisma.user.deleteMany({
    where: { githubId: "octocat_tester" },
  });

  // 1. Seed 1 test User
  const user = await prisma.user.create({
    data: {
      githubId: "octocat_tester",
      username: "octocat",
      name: "The Octocat",
      email: "octocat@github.com",
      avatarUrl: "https://avatars.githubusercontent.com/u/583231",
      bio: "Open source enthusiast and test contributor.",
      techStack: ["TypeScript", "React", "Node.js", "Docker"],
    },
  });

  console.log(`Seeded User: ${user.username} (${user.id})`);

  // 2. Seed 6 realistic open-source Issues
  const now = new Date();

  const issueData = [
    {
      githubIssueId: 1001n,
      repoOwner: "facebook",
      repoName: "react",
      issueNumber: 101,
      title: "Add accessible keyboard navigation to Dialog modal component",
      body: "Currently, focus trap does not return to trigger button upon esc press or backdrop click.",
      htmlUrl: "https://github.com/facebook/react/issues/101",
      subfield: SubField.FRONTEND_UI,
      difficulty: Difficulty.BEGINNER,
      tags: ["React", "TypeScript", "Tailwind CSS"],
      aiSummary:
        "Focus trap in the modal dialog fails to restore focus to the originating trigger element upon dismissal. Addressing this will ensure complete WCAG 2.1 AA accessibility compliance across interactive dialogs.",
      aiActionPlan: [
        "Inspect the modal component's keydown event listener and identify focus return refs.",
        "Implement a cleanup hook that restores document focus to the triggering element on unmount.",
        "Add unit tests using React Testing Library to verify tab order and escape key behavior.",
      ],
      isOpen: true,
      githubUpdatedAt: now,
    },
    {
      githubIssueId: 1002n,
      repoOwner: "tiangolo",
      repoName: "fastapi",
      issueNumber: 202,
      title: "Improve validation error response serialization for nested models",
      body: "Nested Pydantic models in route query params return a 500 status rather than standard 422 JSON payload.",
      htmlUrl: "https://github.com/tiangolo/fastapi/issues/202",
      subfield: SubField.BACKEND_API,
      difficulty: Difficulty.INTERMEDIATE,
      tags: ["Python", "FastAPI"],
      aiSummary:
        "Validation errors on deeply nested request models improperly trigger unhandled exceptions instead of 422 Unprocessable Entity responses. The serialization handler must gracefully parse complex validation errors.",
      aiActionPlan: [
        "Locate the exception handler responsible for RequestValidationError parsing in routing.",
        "Extend the error dictionary formatter to recursively format nested validation details.",
        "Write pytest test cases for multi-level nested models ensuring proper 422 status and JSON schema.",
      ],
      isOpen: true,
      githubUpdatedAt: now,
    },
    {
      githubIssueId: 1003n,
      repoOwner: "moby",
      repoName: "moby",
      issueNumber: 303,
      title: "Optimize multi-stage Docker build cache invalidation for Go binaries",
      body: "Layer caching invalidates prematurely when go.sum contains unused indirect dependencies.",
      htmlUrl: "https://github.com/moby/moby/issues/303",
      subfield: SubField.DEVOPS_CONFIG,
      difficulty: Difficulty.INTERMEDIATE,
      tags: ["Go", "Docker"],
      aiSummary:
        "Premature cache invalidation during multi-stage Docker container builds leads to extended pipeline runtimes. Reordering Dockerfile instructions and isolating dependency manifests will optimize build velocity.",
      aiActionPlan: [
        "Separate go.mod and go.sum copy layers from the main application source copy step in Dockerfile.",
        "Leverage BuildKit cache mounts (--mount=type=cache) for Go pkg/mod directories.",
        "Benchmark container build times in CI before and after the caching reconfiguration.",
      ],
      isOpen: true,
      githubUpdatedAt: now,
    },
    {
      githubIssueId: 1004n,
      repoOwner: "prisma",
      repoName: "prisma",
      issueNumber: 404,
      title: "Add index recommendation and query plan analyzer for foreign key relations",
      body: "High latency queries detected on unindexed relations with large join datasets in PostgreSQL.",
      htmlUrl: "https://github.com/prisma/prisma/issues/404",
      subfield: SubField.DATABASE,
      difficulty: Difficulty.INTERMEDIATE,
      tags: ["Node.js", "Express", "PostgreSQL"],
      aiSummary:
        "Foreign key lookups without dedicated indexes cause sequential table scans on high-volume PostgreSQL tables. Adding compound index recommendations reduces lookup query latency significantly.",
      aiActionPlan: [
        "Analyze EXPLAIN ANALYZE execution plans across joined queries with missing foreign key indexes.",
        "Add @@index definitions to prisma.schema on foreign key scalar attributes.",
        "Benchmark read throughput before and after applying the migration using k6 or autocannon.",
      ],
      isOpen: true,
      githubUpdatedAt: now,
    },
    {
      githubIssueId: 1005n,
      repoOwner: "rustwasm",
      repoName: "wasm-bindgen",
      issueNumber: 505,
      title: "Create integration tests for WebAssembly SIMD vector operations",
      body: "Missing automated end-to-end test cases verifying SIMD instruction support across browser targets.",
      htmlUrl: "https://github.com/rustwasm/wasm-bindgen/issues/505",
      subfield: SubField.TESTING,
      difficulty: Difficulty.BEGINNER,
      tags: ["Rust", "Wasm"],
      aiSummary:
        "WebAssembly 128-bit SIMD vector instructions lack comprehensive test coverage across modern runtime engines. Comprehensive integration tests will prevent regressions during compiler optimization passes.",
      aiActionPlan: [
        "Construct sample vector operation test modules using wasm-bindgen-test harness.",
        "Configure headless Chromium and Node.js runners with experimental SIMD flags enabled.",
        "Verify assertions for vector dot-product and arithmetic SIMD operations in CI.",
      ],
      isOpen: true,
      githubUpdatedAt: now,
    },
    {
      githubIssueId: 1006n,
      repoOwner: "mdn",
      repoName: "content",
      issueNumber: 606,
      title: "Document View Transitions API browser compatibility and fallback techniques",
      body: "The View Transitions guide needs practical fallback examples for browsers lacking native support.",
      htmlUrl: "https://github.com/mdn/content/issues/606",
      subfield: SubField.DOCS,
      difficulty: Difficulty.BEGINNER,
      tags: ["HTML", "CSS", "Docs"],
      aiSummary:
        "The MDN guide for the View Transitions API lacks progressive enhancement examples for unsupported browsers. Clear code samples showing feature detection and CSS fallbacks will assist frontend developers.",
      aiActionPlan: [
        "Draft a new guide section explaining document.startViewTransition feature detection.",
        "Provide CSS fallback code snippets demonstrating smooth standard opacity transitions.",
        "Submit markdown changes according to MDN style guide conventions and lint guidelines.",
      ],
      isOpen: true,
      githubUpdatedAt: now,
    },
  ];

  const createdIssues = [];
  for (const issue of issueData) {
    const created = await prisma.issue.create({ data: issue });
    createdIssues.push(created);
  }

  console.log(`Seeded ${createdIssues.length} Issues.`);

  // 3. Seed 2 initial UserActivity records linked to the test user
  const activity1 = await prisma.userActivity.create({
    data: {
      userId: user.id,
      issueId: createdIssues[0].id,
      status: ActivityStatus.IN_PROGRESS,
      notes: "Started implementing accessible focus trap cleanup hook.",
    },
  });

  const activity2 = await prisma.userActivity.create({
    data: {
      userId: user.id,
      issueId: createdIssues[1].id,
      status: ActivityStatus.COMPLETED,
      notes: "Submitted PR fixing nested Pydantic model error formatting.",
    },
  });

  console.log(`Seeded 2 UserActivity records: [${activity1.status}, ${activity2.status}]`);
  console.log("Database seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
