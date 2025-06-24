import React, { useState, useEffect } from 'react';
import { fetchNotifications, markNotificationRead, clearReadNotifications } from './api';
import '../styles/NotificationsTab.css';

export default function NotificationsTab() {
  const [notes, setNotes] = useState([]);
  const [open, setOpen]   = useState(false);

  useEffect(() => {
    if (open) {
      fetchNotifications().then(r => setNotes(r.data));
    }
  }, [open]);

  const onMarkRead = async id => {
    await markNotificationRead(id);
    setNotes(notes.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const onClearRead = async () => {
    await clearReadNotifications();
    setNotes(notes.filter(n => !n.is_read));  // remove all read messages locally
  };

  const unreadCount = notes.filter(n => !n.is_read).length;
  const readCount   = notes.filter(n => n.is_read).length;

  return (
    <div className="notif-container">
      <button className="notif-icon" onClick={() => setOpen(o => !o)}>
        🛎️{unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-dropdown">
          {notes.length === 0
            ? <div className="no-notif">No notifications</div>
            : (
              <>
                <div className="notif-actions">
                  {readCount > 0 && (
                    <button className="btn-clear-read" onClick={onClearRead}>
                      Delete all read
                    </button>
                  )}
                </div>
                {notes.map(n => (
                  <div key={n.id} className={`notif-item ${n.is_read ? 'read' : ''}`}>
                    <div className="notif-msg">{n.message}</div>
                    <div className="notif-time">
                      {new Date(n.created_at).toLocaleString()}
                    </div>
                    {!n.is_read && (
                      <button
                        className="btn-mark-read"
                        onClick={() => onMarkRead(n.id)}
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                ))}
              </>
            )
          }
        </div>
      )}
    </div>
  );
}
