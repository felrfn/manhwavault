import express from "express";
import cors from "cors";
import * as helmet from "helmet";
import { httpLogger } from "./lib/logger.js";
import routes from "./routes/index.js";
import { errorHandler } from "./middlewares/error.js";

export const app = express();

app.use(helmet.default());
app.use(cors());
app.use(express.json());
app.use(httpLogger);

app.get("/api/v1/health", (_req, res) => {
  res.json({
    success: true,
    data: { status: "ok", time: new Date().toISOString() },
  });
});

app.use("/api/v1", routes);

app.use(errorHandler);
