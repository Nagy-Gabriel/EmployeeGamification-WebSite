import React from 'react'
import ProgressBar from './ProgressBar2'
import '../styles/QuestCard.css'

export default function QuestCard({ quest, onClick }) {
  return (
    <div className="quest-card" onClick={() => onClick(quest)}>
      <div className="quest-card-header">
        <h3 className="quest-title">{quest.title}</h3>
        <span className="quest-category">{quest.category}</span>
      </div>
      <p className="quest-desc">{quest.description}</p>
      <ProgressBar percent={(quest.progress || 0) * 20} />
      <div className="quest-rewards">
        <span>{quest.xp_reward} XP</span>
        <span>{quest.points_reward} pts</span>
      </div>
    </div>
  )
}
