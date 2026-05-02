import { useState } from "react";
import { Log } from "../utils/logger.js";
import { useNotifications } from "../hooks/useNotifications.js";
import { NotificationCard } from "../components/NotificationCard.js";
import { Composer } from "../components/Composer.js";

/**
 * Top-level page: shows the current user's inbox plus the composer.
 * The "current user" is editable inline so the same UI can demo as
 * different recipients without auth.
 */
export function InboxPage() {
  const [currentUserId, setCurrentUserId] = useState("user_alice");
  const { items, loading, error, refresh, setStatus, remove } =
    useNotifications(currentUserId);

  void Log(
    "frontend",
    "debug",
    "page",
    `InboxPage rendered for ${currentUserId}`
  );

  return (
    <main className="app">
      <h1 className="app__title">Notifications</h1>

      <div className="row row--spaced">
        <input
          className="input row__grow"
          value={currentUserId}
          onChange={(e) => setCurrentUserId(e.target.value)}
          placeholder="Your user id"
          aria-label="Current user id"
        />
        <button
          type="button"
          className="btn"
          onClick={() => void refresh()}
          disabled={loading}
        >
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      <Composer
        defaultSenderId="user_admin"
        defaultRecipientId={currentUserId}
        onCreated={() => void refresh()}
      />

      {error && (
        <div className="error" role="alert">
          Failed to load: {error}
        </div>
      )}

      {!loading && items.length === 0 && (
        <p className="empty">No notifications yet.</p>
      )}

      {items.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onStatusChange={setStatus}
          onDelete={remove}
        />
      ))}
    </main>
  );
}
