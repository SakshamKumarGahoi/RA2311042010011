import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import {initLogger} from 'logging_middleware';

import notificationRoutes from './routes/notificationRoutes';
import {
    errorMiddleware,
    requestLogger,
} from "./middleware/loggingMiddleware";

const token = process.env.LOG_API_TOKEN;

if(!token){
    console.warn('LOG_API_TOKEN is not set. Logging will be disabled.');

}
initLogger({authToken: token ?? ""});

void Log("backend", "info", "config", "logger initialised");
const app = express();
app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/notifications", notificationRoutes);

app.use(errorMiddleware);

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  void Log(
    "backend",
    "info",
    "config",
    `notification service listening on port ${port}`
  );
  console.log(`Notification BE running on http://localhost:${port}`);
});
