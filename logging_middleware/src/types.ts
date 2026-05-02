import {
  STACKS,
  LEVELS,
  BACKEND_ONLY_PACKAGES,
  FRONTEND_ONLY_PACKAGES,
  SHARED_PACKAGES,
} from "./constants.js";

export type Stack = (typeof STACKS)[number];
export type Level = (typeof LEVELS)[number];

export type BackendOnlyPackage = (typeof BACKEND_ONLY_PACKAGES)[number];
export type FrontendOnlyPackage = (typeof FRONTEND_ONLY_PACKAGES)[number];
export type SharedPackage = (typeof SHARED_PACKAGES)[number];

export type Package =
  | BackendOnlyPackage
  | FrontendOnlyPackage
  | SharedPackage;

export interface LogPayload {
  stack: Stack;
  level: Level;
  package: Package;
  message: string;
}

export interface LogApiResponse {
  logID: string;
  message: string;
}

export interface LoggerConfig {
  /**
   * Bearer token for the protected Log API.
   * Get this from the Afford Medical auth endpoint after registering.
   */
  authToken: string;

  /**
   * Override the API URL
   */
  apiUrl?: string;

  /**
   * Request timeout in milliseconds
   */
  timeoutMs?: number;

  /**
   * If true, also mirror the log to console
   */
  echoToConsole?: boolean;
}
