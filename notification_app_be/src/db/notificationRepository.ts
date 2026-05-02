import { v4 as uuid } from "uuid";
import { Log } from "../utils/logger.js";
import type {
  Notification,
  CreateNotificationInput,
  NotificationStatus,
} from "../types/notification.js";
const store = new Map<string, Notification>();

export const notificationRepository = {
  async insert(input: CreateNotificationInput): Promise<Notification> {
    const n: Notification = {
      id: uuid(),
      recipientId: input.recipientId,
      senderId: input.senderId,
      title: input.title,
      body: input.body,
      channel: input.channel ?? "in_app",
      status: "unread",
      createdAt: new Date().toISOString(),
      readAt: null,
    };
    store.set(n.id, n);
    await Log(
      "backend",
      "info",
      "repository",
      `notification ${n.id} persisted for recipient ${n.recipientId}`
    );
    return n;
  },

  async findById(id: string): Promise<Notification | null> {
    const n = store.get(id) ?? null;
    if (!n) {
      await Log(
        "backend",
        "warn",
        "repository",
        `notification ${id} not found in store`
      );
    }
    return n;
  },

  async findByRecipient(recipientId: string): Promise<Notification[]> {
    const list = [...store.values()]
      .filter((n) => n.recipientId === recipientId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    await Log(
      "backend",
      "debug",
      "repository",
      `fetched ${list.length} notifications for recipient ${recipientId}`
    );
    return list;
  },

  async updateStatus(
    id: string,
    status: NotificationStatus
  ): Promise<Notification | null> {
    const n = store.get(id);
    if (!n) {
      await Log(
        "backend",
        "error",
        "db",
        `cannot update status: notification ${id} missing`
      );
      return null;
    }
    n.status = status;
    if (status === "read" && !n.readAt) n.readAt = new Date().toISOString();
    store.set(id, n);
    await Log(
      "backend",
      "info",
      "repository",
      `notification ${id} status -> ${status}`
    );
    return n;
  },

  async deleteById(id: string): Promise<boolean> {
    const ok = store.delete(id);
    await Log(
      "backend",
      ok ? "info" : "warn",
      "repository",
      ok
        ? `notification ${id} deleted`
        : `delete called on missing notification ${id}`
    );
    return ok;
  },
};
