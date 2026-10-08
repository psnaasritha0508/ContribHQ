import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import issuesRouter from "./routes/issues.routes";
import activityRouter from "./routes/activity.routes";
import { startSyncCron, runSyncOnce } from "./services/sync.worker";

// Patch BigInt serialization for JSON responses
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Basic health route
app.get("/api/health", async (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Mounted Routers
app.use("/api/issues", issuesRouter);
app.use("/api/activity", activityRouter);

// Manual sync trigger endpoint
app.post("/api/sync", async (_req: Request, res: Response) => {
  try {
    const result = await runSyncOnce();
    res.json({ message: "Sync triggered successfully", ...result });
  } catch (error) {
    res.status(500).json({ error: "Failed to execute issue sync" });
  }
});

app.listen(port, () => {
  console.log(`[server]: ContribHQ server listening on port ${port}`);
  startSyncCron();
});

export default app;
