export type NotificationChannel = "in_app" | "email" | "sms";

export type NotificationStatus = "unread" | "read" | "archived";

export interface Notification {
  id: string;
  recipientId: string;
  senderId: string;
  title: string;
  body: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  createdAt: string; 
  readAt: string | null;
}

export interface CreateNotificationInput {
  recipientId: string;
  senderId: string;
  title: string;
  body: string;
  channel?: NotificationChannel;
}
