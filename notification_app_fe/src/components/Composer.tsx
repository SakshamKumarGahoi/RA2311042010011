import {useState} from 'react';
import { Log } from "logging-middleware";
import { notificationsApi } from "../api/notificationsApi.js";
import type { NotificationChannel } from "../types/notification.js";

interface ComposerProps {
    defaultSenderID: string;
    defaultRecipientID: string;
    onCreated: () => void;
}

export function Composer({
  defaultSenderId,
  defaultRecipientId,
  onCreated,
}: ComposerProps) {
  const [senderId, setSenderId] = useState(defaultSenderId);
  const [recipientId, setRecipientId] = useState(defaultRecipientId);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [channel, setChannel] = useState<NotificationChannel>("in_app");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !body.trim()) {
      setError("Title and body are required.");
      void Log(
        "frontend",
        "warn",
        "component",
        "composer submit blocked: empty title or body"
      );
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await notificationsApi.create({
        senderId,
        recipientId,
        title: title.trim(),
        body: body.trim(),
        channel,
      });
      void Log(
        "frontend",
        "info",
        "component",
        `composer sent notification to ${recipientId}`
      );
      setTitle("");
      setBody("");
      onCreated();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "unknown";
      setError(msg);
      void Log("frontend", "error", "component", `composer failed: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="composer" onSubmit={handleSubmit} aria-label="Send notification">
      <div className="row">
        <input
          className="input row__grow"
          value={senderId}
          onChange={(e) => setSenderId(e.target.value)}
          placeholder="Sender id"
          aria-label="Sender id"
        />
        <input
          className="input row__grow"
          value={recipientId}
          onChange={(e) => setRecipientId(e.target.value)}
          placeholder="Recipient id"
          aria-label="Recipient id"
        />
        <select
          className="select"
          value={channel}
          onChange={(e) => setChannel(e.target.value as NotificationChannel)}
          aria-label="Channel"
        >
          <option value="in_app">in-app</option>
          <option value="email">email</option>
          <option value="sms">sms</option>
        </select>
      </div>

      <input
        className="input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        aria-label="Notification title"
      />

      <textarea
        className="textarea"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Message body"
        aria-label="Notification body"
      />

      {error && <div className="error" role="alert">{error}</div>}

      <div className="row">
        <button
          type="submit"
          className="btn btn--primary"
          disabled={submitting}
        >
          {submitting ? "Sending…" : "Send notification"}
        </button>
      </div>
    </form>
  );
}
