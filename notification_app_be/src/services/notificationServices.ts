import { Log } from "../utils/logger.js";
import { notificationRepository } from "../db/notificationRepository.js";
import type {
  CreateNotificationInput,
  Notification,
  NotificationStatus,
} from "../types/notification.js";

const VALID_CHANNELS = new Set(["in_app", "email", "sms"]);

export const notificationService = {
  async create(input: CreateNotificationInput): Promise<Notification> {
    if (!input.recipientId || !input.senderId) {
      await Log(
        "backend",
        "error",
        "service",
        "create() missing recipientId or senderId"
      );
      throw new Error("recipientId and senderId are required");
    }
    if (!input.title?.trim() || !input.body?.trim()) {
      await Log(
        "backend",
        "warn",
        "service",
        "create() called with empty title or body"
      );
      throw new Error("title and body must be non-empty");
    }
    if (input.channel && !VALID_CHANNELS.has(input.channel)) {
      await Log(
        "backend",
        "error",
        "service",
        `invalid channel "${input.channel}"`
      );
      throw new Error(`channel must be one of ${[...VALID_CHANNELS].join(", ")}`);
    }

    const n = await notificationRepository.insert(input);
    await Log(
      "backend",
      "info",
      "service",
      `dispatched ${n.channel} notification ${n.id} from ${n.senderId} to ${n.recipientId}`
    );
    return n;
  },

  async listForUser(recipientId: string): Promise<Notification[]> {
    if (!recipientId) {
      await Log(
        "backend",
        "warn",
        "service",
        "listForUser() called without recipientId"
      );
      return [];
    }
    return notificationRepository.findByRecipient(recipientId);
  },

  async setStatus(
    id: string,
    status: NotificationStatus
  ): Promise<Notification | null> {
    const allowed: NotificationStatus[] = ["unread", "read", "archived"];
    if (!allowed.includes(status)) {
      await Log(
        "backend",
        "error",
        "service",
        `setStatus rejected unknown status "${status}"`
      );
      throw new Error("invalid status");
    }
    return notificationRepository.updateStatus(id, status);
  },

  async remove(id: string): Promise<boolean> {
    return notificationRepository.deleteById(id);
  },
};
