// src/pages/BadgesPoints.js
import React, { useState, useEffect } from 'react';
import api from './api';
import '../styles/BadgesPoints.css';

function calcLevel(xp) {
  return Math.min(Math.floor(xp / 100) + 1, 30);
}
function pctToNext(xp) {
  return Math.round(((xp % 100) / 100) * 100);
}
function XPBar({ xp }) {
  const pct = pctToNext(xp);
  return (
    <div className="xp-bar">
      <div 
        className="xp-bar-fill" 
        style={{ width: `${pct}%` }} 
      />
      <span className="xp-bar-label">{pct}%</span>
    </div>
  );
}

export default function BadgesPoints() {
  const [data,   setData]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    api.get('badges-points/')
      .then(res => {
        setData(res.data);
        setError(null);
      })
      .catch(err => setError(err.toString()))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="bp-status">Loading…</div>;
  if (error)   return <div className="bp-status error">Error: {error}</div>;

  const {
    username, xp, points, tasks_done,
    level, xp_to_next, points_to_next, tasks_to_next,
    xp_badge, task_badge, point_badge,
  } = data;

  return (
    <div className="bp-page">
      <h1 className="bp-title">Your Badges &amp; Stats</h1>

      <section className="bp-stats">
        <div className="bp-stat"><strong>User:</strong> {username}</div>
        <div className="bp-stat"><strong>Level:</strong> {level}</div>
        <XPBar xp={xp} />
        <div className="bp-stat">
          <strong>XP:</strong> {xp} (<em>{xp_to_next} to next level</em>)
        </div>

        <div className="bp-stat">
          <strong>Tasks Done:</strong> {tasks_done}
        </div>
        {tasks_to_next > 0 && (
          <div className="bp-stat">
            {tasks_to_next} more task{tasks_to_next>1?'s':''} for next badge
          </div>
        )}

        <div className="bp-stat">
          <strong>Points:</strong> {points}
        </div>
        {points_to_next > 0 && (
          <div className="bp-stat">
            {points_to_next} more point{points_to_next>1?'s':''} for next badge
          </div>
        )}
      </section>

      <section className="bp-badges">
        <div className="bp-badge">
          <h2 className="bp-badge-title">XP Badge</h2>
          {xp_badge
            ? <img className="bp-badge-img" src={`/badges/${xp_badge}.png`} alt={xp_badge} />
            : <div className="bp-none">no badge yet</div>
          }
        </div>
        <div className="bp-badge">
          <h2 className="bp-badge-title">Tasks Badge</h2>
          {task_badge
            ? <img className="bp-badge-img" src={`/badges/${task_badge}.png`} alt={task_badge} />
            : <div className="bp-none">no badge yet</div>
          }
        </div>
        <div className="bp-badge">
          <h2 className="bp-badge-title">Points Badge</h2>
          {point_badge
            ? <img className="bp-badge-img" src={`/badges/${point_badge}.png`} alt={point_badge} />
            : <div className="bp-none">no badge yet</div>
          }
        </div>
      </section>
    </div>
  );
}
