import React, { useState, useEffect } from 'react';
import api from './api';
import '../styles/Quests.css';
import QuestCard from '../components/QuestCard';

function calcLevel(xp) {
  const lvl = Math.floor(xp / 100) + 1;
  return Math.min(lvl, 30);
}

// calculează procentul de progres în nivelul curent
function pctToNext(xp) {
  const withinLevel = xp % 100;        // 0–99
  return Math.round((withinLevel / 100) * 100);
}

// un component simplu XPBar
function XPBar({ xp }) {
  const pct = pctToNext(xp);
  return (
    <div className="xp-bar">
      <div className="xp-bar-fill" style={{ width: `${pct}%` }} />
      <span className="xp-bar-label">{pct}%</span>
    </div>
  );
}

function ProgressBar({ percent }) {
  return (
    <div className="progress-bar">
      <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
    </div>
  );
}



function QuestDetailModal({ quest, isOpen, onClose, onStart, onComplete, onDelete, actionLoading, profile }) {
  if (!isOpen || !quest) return null;

  const isStarted   = quest.status === 'in_progress';
  const isCompleted = quest.status === 'completed';

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* X-ul în dreapta sus */}
        <button className="modal-close" onClick={onClose}>×</button>
        <h2 className="modal-title">{quest.title}</h2>
        <p className="modal-desc">{quest.description}</p>
        <ProgressBar percent={(quest.progress || 0) * 20} />

        {/* AICI — afişează xp_reward și points_reward */}
        <div className="modal-rewards">
          <span className="reward-item">XP: <strong>{quest.xp_reward ?? 0}</strong></span>
          <span className="reward-item">Points: <strong>{quest.points_reward ?? 0}</strong></span>
        </div>

        <div className="modal-actions">
          {!isStarted && !isCompleted && (
            <button onClick={() => onStart(quest.id)} className="btn-start">Start</button>
          )}
          {isStarted && !isCompleted && (
            <button onClick={() => onComplete(quest.id)} className="btn-complete">Complete</button>
          )}
          {(profile?.role === 'manager' || profile?.role === 'admin') && (
            <button
              onClick={() => onDelete(quest.id)}
              disabled={actionLoading}
              className="btn-delete"
            >
              Delete
            </button>
          )}
          <button onClick={onClose} className="btn-close">Close</button>
        </div>
      </div>
    </div>
  );
}


function AddQuestModal({ isOpen, onClose, onCreate }) {
  const [form, setForm]   = useState({
    title: '', description: '', category: 'daily',
    xp_reward: 0, points_reward: 0,
    start_date: '', due_date: '', is_active: true
  });
  const [error, setError] = useState(null);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const submit = async () => {
    try {
      await onCreate(form);
      onClose();
      setForm({
        title: '', description: '', category: 'daily',
        xp_reward: 0, points_reward: 0,
        start_date: '', due_date: '', is_active: true
      });
      setError(null);
    } catch {
      setError('Failed to create quest.');
    }
  };

  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Add Quest</h2>
        {error && <p className="form-error">{error}</p>}
        <form className="add-quest-form" onSubmit={e => { e.preventDefault(); submit(); }}>
          <input name="title" placeholder="Title" value={form.title} onChange={handleChange} />
          <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />
          <select name="category" value={form.category} onChange={handleChange}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="team">Team</option>
            <option value="special">Special</option>
          </select>
          <input name="xp_reward" type="number" placeholder="XP reward" value={form.xp_reward} onChange={handleChange} />
          <input name="points_reward" type="number" placeholder="Points reward" value={form.points_reward} onChange={handleChange} />
          <input name="start_date" type="date" value={form.start_date} onChange={handleChange} />
          <input name="due_date" type="date" value={form.due_date} onChange={handleChange} />
          <label>
            <input name="is_active" type="checkbox" checked={form.is_active} onChange={handleChange} />
            Active
          </label>
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
            <button type="submit" className="btn-submit">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Quests() {
  const [quests, setQuests]           = useState([]);
  const [profile, setProfile]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [selected, setSelected]       = useState(null);
  const [modalOpen, setModalOpen]     = useState(false);
  const [addOpen, setAddOpen]         = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [userQuests, setUserQuests]   = useState([]);


  const refreshProfile = async () => {
    try {
      const res = await api.get('profile/');
      setProfile(res.data);
    } catch (err) {
      console.error('Could not reload profile', err);
    }
  };


  useEffect(() => {
    setLoadingProfile(true);
    Promise.all([
      refreshQuests(),
      api.get('profile/').then(r => setProfile(r.data)),
    ])
      .catch(err => setError(err.toString()))
      .finally(() => setLoadingProfile(false));
  }, []);

  const openModal  = quest => { setSelected(quest); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setSelected(null); };

  const startQuest = async id => {
    setActionLoading(true);
    try {
      // 1) tell the server "start"
      await api.post(`quests/${id}/start/`);
  
      // 2) re-load both your profile (xp/points bar) AND your quest grid
      await Promise.all([ refreshProfile(), refreshQuests() ]);
  
      // 3) re-load *this* quest + its userQuest so the modal shows "in_progress"
      const updated = await fetchQuestDetail(id);
      setSelected(updated);
    } catch (err) {
      alert(err.response?.data?.detail || 'Could not start quest');
    } finally {
      setActionLoading(false);
    }
  };

  async function fetchQuestDetail(id) {
    const [ { data: quest }, { data: uqs } ] = await Promise.all([
      api.get(`quests/${id}/`),
      api.get(`user-quests/?quest=${id}`)
    ]);
    const uq = uqs[0];
    return {
      ...quest,
      status:   uq?.status   || 'pending',
      progress: uq?.progress || 0,
    };
  }

  const refreshQuests = async () => {
    setLoading(true);
    try {
      const [questsRes, uqsRes] = await Promise.all([
        api.get('quests/'),
        api.get('user-quests/'),
      ]);
      // build map of user-quests
      const uqMap = new Map(uqsRes.data.map(uq => [uq.quest.id, uq]));
      // merge into quests
      const merged = questsRes.data.map(q => ({
        ...q,
        status:   uqMap.get(q.id)?.status   || 'pending',
        progress: uqMap.get(q.id)?.progress || 0,
      }));
      setQuests(merged);
      setUserQuests(uqsRes.data);
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

const completeQuest = async id => {
  setActionLoading(true);
  try {
    // 1) mark complete
    await api.post(`quests/${id}/complete/`);

    // 2) re-fetch profile & quests list in parallel
    await Promise.all([ refreshProfile(), refreshQuests() ]);

    // 3) re-fetch just this quest + its userQuest
    const updated = await fetchQuestDetail(id);
    setSelected(updated);
  } catch (err) {
    console.error('❌ Quest complete failed:', err);
    console.error('Response:', err.response);
    alert(err.response?.data?.detail || 'Could not complete quest');
  }
};

  const deleteQuest = async id => {
    if (!window.confirm('Are you sure?')) return;
    setActionLoading(true);
    try {
      await api.delete(`quests/${id}/`);
      setQuests(prev => prev.filter(q => q.id !== id));
      closeModal();
    } catch (e) { alert(e.response?.data.detail); }
    setActionLoading(false);
  };

  const createQuest = data =>
    api.post('quests/', data).then(res =>
      setQuests(prev => [res.data, ...prev])
    );

  if (loading) return <div className="status">Loading quests…</div>;
  if (error)   return <div className="status error">Error: {error}</div>;

  return (
    <div className="quests-page">
      <div className="header">
        <h1>Quests</h1>

        {/* --- STATUS ANGAJAT --- */}
        {!loadingProfile && profile && (
          <div className="user-status">
            <span className="user-points">Points: {profile.points}</span>
            <span className="user-level">Level: {calcLevel(profile.xp)}</span>
            <XPBar xp={profile.xp} />
          </div>
        )}

        {/* buton Add Quest doar manager/admin */}
        {!loadingProfile && ['manager','admin'].includes(profile.role) && (
          <button
            onClick={() => setAddOpen(true)}
            className="btn-add"
          >
            + Add Quest
          </button>
        )}
      </div>

      {quests.length === 0 ? (
        <p className="text-gray-400">Quest are not availabile, wait for admins to create one</p>
      ) : (
        <div className="quests-grid">
          {quests.map(q => (
            <QuestCard key={q.id} quest={q} onClick={openModal} />
          ))}
        </div>
      )}

      <QuestDetailModal
        quest={selected}
        isOpen={modalOpen}
        onClose={closeModal}
        onStart={startQuest}
        onComplete={completeQuest}
        onDelete={deleteQuest}
        actionLoading={actionLoading}
        profile={profile}
      />
      <AddQuestModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onCreate={createQuest}
      />
    </div>
  );
}
