import express from "express";
import cors from "cors";
import helmet from "helmet";
import WebSocket from "ws";
import { config } from "./config/env";
import authRoutes from "./routes/auth";
import logsRoutes from "./routes/logs";
import rateLimit from "express-rate-limit";
import http from "http";

export const app = express();

app.use(
  cors({
    origin: config.ALLOWED_ORIGINS,
    credentials: true,
  })
);

app.use(helmet());
app.use(express.json());

// Rate limiter
export const authLimiter = rateLimit({
  windowMs: config.RATE_LIMIT.WINDOW_MS,
  max: config.RATE_LIMIT.MAX_REQUESTS,
});

app.use("/api/auth", authRoutes);
app.use("/api/logs", logsRoutes);

export const server = http.createServer(app);
export const wss = new WebSocket.Server({ server });

export const start = () => {
  return new Promise((resolve) => {
    server.listen(config.PORT, () => {
      const address = server.address();
      const port = address
        ? typeof address === "object"
          ? address.port
          : config.PORT
        : config.PORT;
      console.log(`Server running on port ${port}`);
      resolve({ port });
    });
  });
};

export const close = async () => {
  return new Promise((resolve) => {
    server?.close(() => {
      wss?.close(() => {
        resolve(true);
      });
    });
  });
};

// Start server if not in test environment
if (process.env.NODE_ENV !== "test") {
  start();
}

export default app;
