import React, { useEffect, useState } from 'react';
import api from './api';
import '../styles/AdminPanel.css';

function AdminPanel() {
  const [joinRequests, setJoinRequests] = useState([]);
  const [removeRequests, setRemoveRequests] = useState([]);
  const token = localStorage.getItem('access');

  useEffect(() => {
    api.get('join-requests/')
      .then(res => setJoinRequests(res.data))
      .catch(err => console.error(err));
  }, []);

  const fetchRequests = async () => {
    try {
      const joinRes = await api.get('/join-requests/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const removeRes = await api.get('/remove-requests/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJoinRequests(joinRes.data);
      setRemoveRequests(removeRes.data);
    } catch (err) {
      console.error("Failed fetching requests", err);
    }
  };

  const handleAction = async (type, id, action) => {
    try {
      await api.post(`/${type}/${id}/${action}/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRequests(); // refresh
      alert(`${type} ${action}d successfully!`);
    } catch (err) {
      alert("Action failed.");
      console.error(err);
    }
  };

  return (
    <div className="container">
      <h2>Admin Panel – Pending Requests</h2>

      <div>
        <h3>Join Requests</h3>
        {joinRequests.length === 0 && <p>No join requests pending.</p>}
        <ul>
          {joinRequests.map(req => (
            <li key={req.id}>
              <b>{req.user.username}</b> wants to join <i>{req.team.name}</i>
              <button onClick={() => handleAction('join-requests', req.id, 'approve')}>Approve</button>
              <button onClick={() => handleAction('join-requests', req.id, 'reject')}>Reject</button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3>Remove Requests</h3>
        {removeRequests.length === 0 && <p>No remove requests pending.</p>}
        <ul>
          {removeRequests.map(req => (
            <li key={req.id}>
              <b>{req.requested_by?.username}</b> requested removal of <b>{req.user_to_remove?.username}</b> from <i>{req.team.name}</i> – Reason: {req.reason}
              <button onClick={() => handleAction('remove-requests', req.id, 'approve')}>Approve</button>
              <button onClick={() => handleAction('remove-requests', req.id, 'reject')}>Reject</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AdminPanel;
