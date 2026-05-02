import axios, { AxiosError } from "axios";
import {
  STACKS,
  LEVELS,
  BACKEND_ONLY_PACKAGES,
  FRONTEND_ONLY_PACKAGES,
  SHARED_PACKAGES,
  LOG_API_URL,
} from "./constants.js";
import type {
  Stack,
  Level,
  Package,
  LogApiResponse,
  LoggerConfig,
} from "./types.js";
function isStack(value: string): value is Stack {
  return (STACKS as readonly string[]).includes(value);
}

function isLevel(value: string): value is Level {
  return (LEVELS as readonly string[]).includes(value);
}

function isValidPackageForStack(stack: Stack, pkg: string): pkg is Package {
  const shared = SHARED_PACKAGES as readonly string[];
  if (shared.includes(pkg)) return true;
  if (stack === "backend") {
    return (BACKEND_ONLY_PACKAGES as readonly string[]).includes(pkg);
  }
  return (FRONTEND_ONLY_PACKAGES as readonly string[]).includes(pkg);
}

let _config: LoggerConfig | null = null;
export function initLogger(config: LoggerConfig): void {
  _config = {
    apiUrl: LOG_API_URL,
    timeoutMs: 5000,
    echoToConsole: true,
    ...config,
  };
}

export async function Log(
  stack: string,
  level: string,
  pkg: string,
  message: string
): Promise<LogApiResponse | null> {
  const s = String(stack).toLowerCase().trim();
  const l = String(level).toLowerCase().trim();
  const p = String(pkg).toLowerCase().trim();
  const m = String(message ?? "");

  if (!isStack(s)) {
    console.warn(
      `[logger] invalid stack "${stack}" - must be one of ${STACKS.join(", ")}`
    );
    return null;
  }
  if (!isLevel(l)) {
    console.warn(
      `[logger] invalid level "${level}" - must be one of ${LEVELS.join(", ")}`
    );
    return null;
  }
  if (!isValidPackageForStack(s, p)) {
    console.warn(
      `[logger] package "${pkg}" is not valid for stack "${s}"`
    );
    return null;
  }
  if (!m) {
    console.warn("[logger] message is empty - skipping log call");
    return null;
  }

  if (_config?.echoToConsole !== false) {
    const ts = new Date().toISOString();
    console.log(`[${ts}] [${s}] [${l}] [${p}] ${m}`);
  }

  if (!_config) {
    console.warn(
      "[logger] initLogger() was not called - log will not be sent to API"
    );
    return null;
  }

  try {
    const res = await axios.post<LogApiResponse>(
      _config.apiUrl ?? LOG_API_URL,
      { stack: s, level: l, package: p, message: m },
      {
        timeout: _config.timeoutMs,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${_config.authToken}`,
        },
      }
    );
    return res.data;
  } catch (err) {
    const ax = err as AxiosError;
    const status = ax.response?.status;
    const body = ax.response?.data;
    console.warn(
      `[logger] failed to send log (status=${status ?? "n/a"}):`,
      body ?? ax.message
    );
    return null;
  }
}
export * from "./types.js";
export {
  STACKS,
  LEVELS,
  BACKEND_ONLY_PACKAGES,
  FRONTEND_ONLY_PACKAGES,
  SHARED_PACKAGES,
} from "./constants.js";
