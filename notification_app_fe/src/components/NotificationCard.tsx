import { Log } from "logging-middleware";
import type {
  Notification,
  NotificationStatus,
} from "../types/notification.js";

interface NotificationCardProps {
  notification: Notification;
  onStatusChange: (id: string, status: NotificationStatus) => void;
  onDelete: (id: string) => void;
}

/**
 * Renders a single notification with action buttons.
 * Pure presentational - all data and callbacks are received via props.
 */
export function NotificationCard({
  notification,
  onStatusChange,
  onDelete,
}: NotificationCardProps) {
  const timestamp = new Date(notification.createdAt).toLocaleString();

  const handleMarkRead = () => {
    void Log(
      "frontend",
      "info",
      "component",
      `user marked notification ${notification.id} as read`
    );
    onStatusChange(notification.id, "read");
  };

  const handleArchive = () => {
    void Log(
      "frontend",
      "info",
      "component",
      `user archived notification ${notification.id}`
    );
    onStatusChange(notification.id, "archived");
  };

  const handleDelete = () => {
    void Log(
      "frontend",
      "warn",
      "component",
      `user deleting notification ${notification.id}`
    );
    onDelete(notification.id);
  };

  const cardClass =
    notification.status === "unread" ? "card card--unread" : "card";

  return (
    <article className={cardClass}>
      <header className="card__header">
        <div>
          <div className="card__title">{notification.title}</div>
          <span className="badge">{notification.channel.replace("_", " ")}</span>
        </div>
        <time className="card__time" dateTime={notification.createdAt}>
          {timestamp}
        </time>
      </header>

      <p className="card__body">{notification.body}</p>

      <div className="row">
        {notification.status !== "read" && (
          <button type="button" className="btn" onClick={handleMarkRead}>
            Mark read
          </button>
        )}
        {notification.status !== "archived" && (
          <button type="button" className="btn" onClick={handleArchive}>
            Archive
          </button>
        )}
        <button type="button" className="btn btn--danger" onClick={handleDelete}>
          Delete
        </button>
      </div>
    </article>
  );
}
