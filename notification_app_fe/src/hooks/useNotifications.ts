import { useCallback, useEffect, useState } from "react";
import { Log } from "logging-middleware";
import { notificationsApi } from "../api/notificationsApi.js";
import type {
  Notification,
  NotificationStatus,
} from "../types/notification.js";

export function useNotifications(recipientId: string) {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!recipientId) return;
    setLoading(true);
    setError(null);
    try {
      const list = await notificationsApi.list(recipientId);
      setItems(list);
      await Log(
        "frontend",
        "info",
        "hook",
        `loaded ${list.length} notifications for ${recipientId}`
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "unknown";
      setError(msg);
      await Log("frontend", "error", "hook", `useNotifications load failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [recipientId]);

  const setStatus = useCallback(
    async (id: string, status: NotificationStatus) => {
      try {
        const updated = await notificationsApi.setStatus(id, status);
        setItems((prev) => prev.map((n) => (n.id === id ? updated : n)));
      } catch (e) {
        const msg = e instanceof Error ? e.message : "unknown";
        await Log("frontend", "error", "hook", `setStatus failed for ${id}: ${msg}`);
      }
    },
    []
  );

  const remove = useCallback(async (id: string) => {
    try {
      await notificationsApi.remove(id);
      setItems((prev) => prev.filter((n) => n.id !== id));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "unknown";
      await Log("frontend", "error", "hook", `remove failed for ${id}: ${msg}`);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { items, loading, error, refresh, setStatus, remove };
}
