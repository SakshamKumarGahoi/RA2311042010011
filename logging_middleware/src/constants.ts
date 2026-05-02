export const STACKS = ["backend", "frontend"] as const;

export const LEVELS = ["debug", "info", "warn", "error", "fatal"] as const;
export const BACKEND_ONLY_PACKAGES = [
  "cache",
  "controller",
  "cron_job",
  "db",
  "domain",
  "handler",
  "repository",
  "route",
  "service",
] as const;
export const FRONTEND_ONLY_PACKAGES = [
  "api",
  "component",
  "hook",
  "page",
  "state",
  "style",
] as const;

export const SHARED_PACKAGES = [
  "auth",
  "config",
  "middleware",
  "utils",
] as const;

export const LOG_API_URL =
  "http://20.207.122.201/evaluation-service/logs";
