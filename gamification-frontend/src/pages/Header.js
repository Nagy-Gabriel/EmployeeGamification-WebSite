// src/components/Header.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Header.css';
import { FaRocket } from "react-icons/fa";
import NotificationsTab from './NotificationsTab';

function Header() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');
  const role = localStorage.getItem('role');
  const [showExtra, setShowExtra] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="logo">🚀RocketQuest </div>
      <FaRocket />
      <p>Push your limits and take off with your team!</p>
      

      <nav className="nav-links">
        <Link to="/team-management" className="nav-btn">Team Management</Link>
        <Link to="/tasks" className="nav-btn">Task Management</Link>

        <div className="dropdown">
          <button className="nav-btn dropdown-toggle" onClick={() => setShowExtra(!showExtra)}>⋯</button>
          {showExtra && (
            <div className="dropdown-menu">
              <Link to="/badges-points" className="dropdown-item">Badges & Points</Link>
              <Link to="/absence-calendar" className="dropdown-item">Absence Calendar</Link>
              <Link to="/reports" className="dropdown-item">Reports</Link>
              <Link to="/leaderboard" className="dropdown-item">Leaderboard</Link>
              <Link to="/quests" className="dropdown-item">Quests</Link>
              <Link to="/ask-ai" className="dropdown-item">Help?</Link>
              <Link to="/quiz" className="dropdown-item">Quiz</Link>
            </div>
          )}
        </div>

        {!username ? (
          <>
            <Link to="/login" className="nav-btn">Login</Link>
            <Link to="/register" className="nav-btn">Register</Link>
          </>
        ) : (
          <>
            {role === 'admin' && (
              <Link to="/admin-panel" className="nav-btn">Admin Panel</Link>
            )}
             <NotificationsTab />
            <span className="greeting">Hello, <strong>{username}</strong>!</span>
            <button onClick={handleLogout} className="nav-btn logout-btn">Logout</button>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;
