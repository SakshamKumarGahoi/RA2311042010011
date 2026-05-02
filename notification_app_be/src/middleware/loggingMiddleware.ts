import type { Request, Response, NextFunction } from "express";
import { Log } from "logging_middleware";
export async function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const msg = err instanceof Error ? err.message : String(err);
  await Log("backend", "fatal", "middleware", `unhandled error: ${msg}`);
  res.status(500).json({ error: "internal server error" });
}
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    void Log(
      "backend",
      res.statusCode >= 500 ? "error" : "info",
      "middleware",
      `${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`
    );
  });
  next();
}
