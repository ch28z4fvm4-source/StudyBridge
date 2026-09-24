import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { conversations } from "../data/mockData";

export default function Chat() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const defaultId = conversations[0]?.id ?? "";
  const activeId = conversationId ?? defaultId;
  const [message, setMessage] = useState("");

  const active = conversations.find((c) => c.id === activeId) ?? conversations[0];

  useEffect(() => {
    if (!conversationId && defaultId) {
      navigate(`/chat/${defaultId}`, { replace: true });
    }
  }, [conversationId, defaultId, navigate]);

  if (!active) {
    return (
      <div className="chat-empty">
        <p>No conversations yet.</p>
        <Link to="/tutors" className="btn btn-primary">
          Find a tutor
        </Link>
      </div>
    );
  }

  const selectConversation = (id: string) => {
    navigate(`/chat/${id}`);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setMessage("");
  };

  return (
    <div className="chat-page">
      <aside className="chat-sidebar">
        <div className="chat-sidebar-header">
          <h2>Messages</h2>
          <span className="badge badge-green">
            {conversations.filter((c) => c.unread).length} unread
          </span>
        </div>
        <div className="chat-sidebar-section">
          <span className="sidebar-label">Active Sessions</span>
          <ul className="channel-list">
            {conversations.map((conv) => (
              <li key={conv.id}>
                <button
                  type="button"
                  className={`channel-item${conv.id === activeId ? " active" : ""}`}
                  onClick={() => selectConversation(conv.id)}
                >
                  <span className="avatar avatar-sm">{conv.tutorAvatar}</span>
                  <div className="channel-info">
                    <strong>{conv.tutorName}</strong>
                    <span>{conv.lastMessage}</span>
                  </div>
                  {conv.unread > 0 && <span className="unread-badge">{conv.unread}</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="chat-sidebar-footer">
          <Link to="/tutors" className="btn btn-ghost btn-sm btn-block">
            Find another tutor
          </Link>
        </div>
      </aside>

      <div className="chat-main">
        <header className="chat-header">
          <div className="chat-header-info">
            <span className="avatar">{active.tutorAvatar}</span>
            <div>
              <strong>{active.tutorName}</strong>
              <span>{active.subject}</span>
            </div>
          </div>
          <div className="chat-header-actions">
            <Link to="/dashboard/student" className="btn btn-sm btn-ghost">
              Back to dashboard
            </Link>
            <Link to="/request" className="btn btn-sm btn-secondary">
              Schedule follow-up
            </Link>
          </div>
        </header>

        <div className="chat-messages">
          <div className="date-divider">
            <span>Today</span>
          </div>
          {active.messages.map((msg) => (
            <div key={msg.id} className={`message-group${msg.isOwn ? " own" : ""}`}>
              {!msg.isOwn && <span className="avatar avatar-sm">{msg.avatar}</span>}
              <div className="message-content">
                {!msg.isOwn && (
                  <div className="message-meta">
                    <strong>{msg.author}</strong>
                    <time>{msg.timestamp}</time>
                  </div>
                )}
                <div className="message-bubble">{msg.content}</div>
                {msg.isOwn && <time className="message-time-own">{msg.timestamp}</time>}
              </div>
            </div>
          ))}
        </div>

        <form className="chat-input-bar" onSubmit={handleSend}>
          <button type="button" className="chat-attach" aria-label="Attach file">
            +
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Message ${active.tutorName}`}
          />
          <button type="submit" className="btn btn-primary btn-sm" disabled={!message.trim()}>
            Send
          </button>
        </form>
      </div>

      <aside className="chat-details">
        <div className="details-section">
          <h3>Session Info</h3>
          <dl className="details-list">
            <div>
              <dt>Subject</dt>
              <dd>{active.subject.split("—")[0].trim()}</dd>
            </div>
            <div>
              <dt>Topic</dt>
              <dd>{active.subject.split("—")[1]?.trim() ?? active.subject}</dd>
            </div>
            <div>
              <dt>Duration</dt>
              <dd>32 min</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <span className="status-pill status-completed">In progress</span>
              </dd>
            </div>
          </dl>
        </div>
        <div className="details-section">
          <h3>About {active.tutorName}</h3>
          <p className="details-bio">
            Math & science tutor. Verified volunteer with 48 hours logged.
          </p>
          <Link to={`/tutors/${active.tutorId}`} className="link-sm">
            View profile →
          </Link>
          <div className="details-stats">
            <div>
              <strong>4.9</strong>
              <span>Rating</span>
            </div>
            <div>
              <strong>23</strong>
              <span>Students</span>
            </div>
            <div>
              <strong>48</strong>
              <span>Hours</span>
            </div>
          </div>
        </div>
        <div className="details-section">
          <h3>Community Guidelines</h3>
          <ul className="guidelines-list">
            <li>Keep conversations focused on learning</li>
            <li>Be respectful and patient</li>
            <li>Report any concerns to moderators</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
