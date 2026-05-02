import React from "react";
import ReactDOM from "react-dom/client";
import { initLogger, Log } from "logging-middleware";
import App from "./App.js";
import "./index.css";

// Boot the shared logger before the app mounts.
initLogger({
  authToken: import.meta.env.VITE_LOG_API_TOKEN ?? "",
});
void Log("frontend", "info", "config", "frontend logger initialised");

// Global error trap -> fatal log
window.addEventListener("error", (e) => {
  void Log(
    "frontend",
    "fatal",
    "utils",
    `uncaught error: ${e.message} @ ${e.filename}:${e.lineno}`
  );
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
