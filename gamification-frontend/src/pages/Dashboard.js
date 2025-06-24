import React from 'react';
import Header from './Header';
import '../styles/Dashboard.css';

function Dashboard() {
  return (
    <div className="dashboard-page">
     <video
       className="bg-video"
       src="/ringloop.mp4"
       autoPlay
       loop
       muted
       playsInline
     />
      <Header />
      <div className="intro-text-container">
        <h1>Welcome to RocketQuest</h1>
        <h1>Unlock Your Team's Full Potential!</h1>
        <p>
          Boost motivation, productivity, and collaboration with our cutting-edge Employee Gamification app. Track achievements, earn badges, climb the leaderboard, and complete exciting quests — all while fostering a positive and engaging workplace culture.
        </p>
        <p>
          Whether you’re managing a team or striving for personal growth, our intuitive platform empowers everyone to perform at their best. Make work fun, rewarding, and inspiring!
        </p>
        <p>
          Join thousands of forward-thinking organizations transforming their workforce through gamified experiences. Ready to take your team's performance to the next level?
        </p>
        <p><strong>Get started today and watch your team's success soar! 🚀</strong></p>
      </div>
    </div>
  );
}

export default Dashboard;
