import dotenv from "dotenv";
import path from "path";

// Load .env file
dotenv.config({ path: path.join(__dirname, "../../.env") });

export const config = {
  // Server
  PORT:
    process.env.NODE_ENV === "test"
      ? 0 // Use 0 to get random available port for testing
      : process.env.PORT || 8080,
  NODE_ENV: process.env.NODE_ENV || "development",

  // Database
  DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db",

  // Authentication
  JWT_SECRET: process.env.JWT_SECRET || "development-secret",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "24h",

  // Security
  RATE_LIMIT: {
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
    MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
  },

  // CORS
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(",") || [
    "http://localhost:3000",
  ],
};

// Validate required environment variables
const requiredEnvVars = ["JWT_SECRET", "DATABASE_URL"];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
}
