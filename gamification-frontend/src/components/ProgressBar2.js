import React from 'react';
import '../styles/ProgressBar2.css';

export default function ProgressBar({ percent }) {
  return (
    <div className="progress-bar-container">
      <div
        className="progress-bar-fill"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
