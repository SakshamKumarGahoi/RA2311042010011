import type { Request, Response } from "express";
import { Log } from "logging_middleware";
import { notificationService } from "../services/notificationService.js";
import type { NotificationStatus } from "../types/notification.js";

export const notificationController = {
  async create(req: Request, res: Response) {
    try {
      const { recipientId, senderId, title, body, channel } = req.body ?? {};
      if (typeof title !== "string" || typeof body !== "string") {
        await Log(
          "backend",
          "error",
          "handler",
          `received ${typeof title}/${typeof body}, expected string for title/body`
        );
        return res.status(400).json({ error: "title and body must be strings" });
      }
      const n = await notificationService.create({
        recipientId,
        senderId,
        title,
        body,
        channel,
      });
      return res.status(201).json(n);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown";
      await Log("backend", "error", "handler", `create failed: ${msg}`);
      return res.status(400).json({ error: msg });
    }
  },

  async list(req: Request, res: Response) {
    try {
      const recipientId = String(req.query.recipientId ?? "");
      if (!recipientId) {
        await Log(
          "backend",
          "warn",
          "handler",
          "list called without recipientId query param"
        );
        return res.status(400).json({ error: "recipientId query param required" });
      }
      const list = await notificationService.listForUser(recipientId);
      return res.json({ count: list.length, notifications: list });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown";
      await Log("backend", "error", "handler", `list failed: ${msg}`);
      return res.status(500).json({ error: msg });
    }
  },

  async patchStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body ?? {};
      const updated = await notificationService.setStatus(
        id,
        status as NotificationStatus
      );
      if (!updated) {
        return res.status(404).json({ error: "notification not found" });
      }
      return res.json(updated);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown";
      await Log("backend", "error", "handler", `patchStatus failed: ${msg}`);
      return res.status(400).json({ error: msg });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const ok = await notificationService.remove(req.params.id);
      if (!ok) return res.status(404).json({ error: "not found" });
      return res.status(204).send();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown";
      await Log("backend", "fatal", "handler", `remove crashed: ${msg}`);
      return res.status(500).json({ error: msg });
    }
  },
};
