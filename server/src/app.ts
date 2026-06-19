import express, { Express } from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import morgan from "morgan";
import { errorHandler } from "./common/middlewares/errorHandler";
import routesV1 from "./routes/v1";

const app: Express = express();

// Set security HTTP headers
app.use(helmet());

// Parse json request body
app.use(express.json());

// Parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// Gzip compression
app.use(compression());

// Enable CORS
app.use(
  cors({
    origin: process.env.LINK_COR || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    exposedHeaders: ["X-Full-Access"],
  }),
);

// HTTP request logger
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// v1 api routes
app.use("/api/v1", routesV1);

// Health check
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    uptime: process.uptime(),
    status: "UP",
    database: "CONNECTED", // Placeholder, updated in index.ts
    timestamp: new Date(),
  });
});

// Global error handler
app.use(errorHandler);

export default app;
