import React, { useState, useEffect } from 'react'
import api from './api'
import '../styles/Leaderboard.css'

export default function Leaderboard() {
  const [board, setBoard] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  function Avatar({ username }) {
    const initials = username.slice(0,2).toUpperCase()
    return <div className="avatar">{initials}</div>
  }

  useEffect(() => {
    setLoading(true)
    api.get('leaderboard/')
       .then(res => setBoard(res.data))
       .catch(err => setError(err.toString()))
       .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="lb-status">Loading leaderboard…</div>
  if (error)   return <div className="lb-status error">Error: {error}</div>

  return (
    <div className="leaderboard-page">
      <h1>Leaderboard</h1>
      <div className="leaderboard-container">
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Avatar</th>
            <th>#</th>
            <th>Employee</th>
            <th>Tasks Done</th>
            <th>Level</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {board.map((u, i) => (
            <tr key={u.username} className={i === 0 ? 'top-1' : i === 1 ? 'top-2' : i === 2 ? 'top-3' : ''}>
              <td><Avatar username={u.username} /></td>
              <td>{i + 1}</td>
              <td>{u.username}</td>
              <td>{u.completed_tasks}</td>
              <td>{u.level}</td>
              <td>{u.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  )
}
