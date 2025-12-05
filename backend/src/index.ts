import express from "express";
import cors from "cors";
import { config } from "./config";
import { connectDB, disconnectDB } from "./db";
import rfpsRouter from "./routes/rfps";
import vendorsRouter from "./routes/vendors";
import proposalsRouter from "./routes/proposals";

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Routes
app.use("/api/rfps", rfpsRouter);
app.use("/api/vendors", vendorsRouter);
app.use("/api/proposals", proposalsRouter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("❌ Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: config.nodeEnv === "development" ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Start server
async function start() {
  try {
    await connectDB();
    console.log("✅ Database connected");

    app.listen(config.port, () => {
      console.log(
        `🚀 Server running on http://localhost:${config.port}`
      );
      console.log(`📧 Using email: ${config.smtpUser}`);
      console.log(`🤖 Using OpenAI API for AI tasks`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await disconnectDB();
  process.exit(0);
});

start();

export default app;
