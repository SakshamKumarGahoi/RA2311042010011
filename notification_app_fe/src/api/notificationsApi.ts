import axios from "axios";
import { Log } from "logging_middleware";
import type{
    Notification,
    NotificationStatus,
    NotificationChannel,

} from "../types/notification.ts";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const http = axios.create({ baseURL , timeout: 5000 });

http.interceptors.request.use(async (cfg) => {
  await Log(
    "frontend",
    "debug",
    "api",
    `→ ${cfg.method?.toUpperCase()} ${cfg.url}`
  );
  return cfg;
});

http.interceptors.response.use(
  async (res) => {
    await Log(
      "frontend",
      "debug",
      "api",
      `← ${res.status} ${res.config.url}`
    );
    return res;
  },
  async (err) => {
    await Log(
      "frontend",
      "error",
      "api",
      `request failed ${err.config?.url}: ${err.message}`
    );
    return Promise.reject(err);
  }
);

export const notificationsApi = {
  async list(recipientId: string): Promise<Notification[]> {
    const r = await http.get<{ count: number; notifications: Notification[] }>(
      "/api/notifications",
      { params: { recipientId } }
    );
    return r.data.notifications;
  },

  async create(input: {
    recipientId: string;
    senderId: string;
    title: string;
    body: string;
    channel: NotificationChannel;
  }): Promise<Notification> {
    const r = await http.post<Notification>("/api/notifications", input);
    return r.data;
  },

  async setStatus(id: string, status: NotificationStatus): Promise<Notification> {
    const r = await http.patch<Notification>(
      `/api/notifications/${id}/status`,
      { status }
    );
    return r.data;
  },

  async remove(id: string): Promise<void> {
    await http.delete(`/api/notifications/${id}`);
  },
};

