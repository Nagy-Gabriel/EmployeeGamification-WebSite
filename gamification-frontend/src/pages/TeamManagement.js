import React, { useEffect, useState } from 'react';
import api from './api';
import '../styles/TeamManagement.css';

function TeamManagement() {
  const [teams, setTeams] = useState([]);
  const [userRole, setUserRole] = useState('');
  const [currentUser, setCurrentUser] = useState({});
  const [membersByTeam, setMembersByTeam] = useState({});
  const [employees, setEmployees] = useState([]);
  const [selectedMember, setSelectedMember] = useState({});
  const [transferTarget, setTransferTarget] = useState({});
  const [myTeamIds, setMyTeamIds] = useState([]);
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    project_theme: '',
  });

  const token = localStorage.getItem('access');

  useEffect(() => {
    fetchProfile();
    fetchTeams();
    fetchEmployees();
    fetchMyTeams();
    // eslint-disable-next-line
  }, []);

  const fetchProfile = async () => {
    const res = await api.get('/profile/', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUserRole(res.data.role);
    setCurrentUser(res.data);
  };

  const fetchTeams = async () => {
    const res = await api.get('/teams/', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTeams(res.data);
  };

  const fetchEmployees = async () => {
    const res = await api.get('/employees/', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setEmployees(res.data);
  };

  const fetchMembers = async (teamId) => {
    const res = await api.get(`/teams/${teamId}/members/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setMembersByTeam((prev) => ({ ...prev, [teamId]: res.data }));
  };

  const createTeam = async () => {
    try {
      await api.post('/teams/', newTeam, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Team created!');
      setNewTeam({ name: '', description: '', project_theme: '' });
      fetchTeams();
    } catch (err) {
      alert('Error: ' + JSON.stringify(err.response?.data));
    }
  };

  const sendJoinRequest = async (teamId) => {
    try {
      await api.post(`/teams/${teamId}/request_join/`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Join request sent.');
    } catch (err) {
      alert(err.response?.data?.error || 'Join request failed.');
    }
  };

  const requestRemoveMember = async (teamId, userId) => {
    const reason = prompt('Enter reason for removal:');
    if (!reason) return;
  
    try {
      await api.post(`/teams/${teamId}/remove_member/`, {
        user_id: userId,
        reason: reason
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      alert('Request sent to Admin.');
    } catch (err) {
      console.error("Remove request failed:", err.response?.data || err.message);
      alert('Remove request failed.\n' + JSON.stringify(err.response?.data));
    }
  };
  
  const fetchMyTeams = async () => {
    try {
      const res = await api.get('/teams/my_team_ids/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyTeamIds(res.data); // array de id-uri
    } catch (err) {
      console.error('Error fetching my teams', err);
    }
  };
  
  const addMember = async (teamId) => {
    if (!selectedMember[teamId]) return alert("Please select an employee.");
    try {
      await api.post(`/teams/${teamId}/add_member/`, {
        user_id: selectedMember[teamId],
        role: 'employee',
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Member added!');
      fetchMembers(teamId);
    } catch (err) {
      alert('Failed to add member.');
    }
  };

  const deleteTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;
    try {
      await api.delete(`/teams/${teamId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Team deleted.');
      fetchTeams();
    } catch (err) {
      alert('Failed to delete team.');
    }
  };

  const transferMember = async (userId, fromTeamId, toTeamId) => {
    if (!toTeamId) return alert('Select a team to transfer to.');
    try {
      await api.post(`/teams/${fromTeamId}/transfer_member/`, {
        user_id: userId,
        new_team_id: toTeamId
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Member transferred successfully!');
      fetchMembers(fromTeamId);
      fetchMembers(toTeamId);
    } catch (err) {
      alert('Transfer failed.');
      console.error(err.response?.data || err.message);
    }
  };
  
  const assignTeamLead = async (teamId, userId) => {
    try {
      await api.post(`/teams/${teamId}/assign_team_lead/`, { user_id: userId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Team Lead updated!');
      fetchTeams(); // reîncarcă datele echipelor
    } catch (err) {
      console.error(err);
      alert('Failed to assign Team Lead.');
    }
  };
  

  const isManagerOfTeam = (team) =>
    team.manager && team.manager.username === currentUser.username;

  return (
    <div className="container">
      <h2>Team Management</h2>

      {(userRole === 'admin' || userRole === 'manager') && (
        <div className="team-form" style={{ marginBottom: '30px' }}>
          <h3>Create New Team</h3>
          <input placeholder="Name" value={newTeam.name} onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })} />
          <input placeholder="Description" value={newTeam.description} onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })} />
          <input placeholder="Project Theme" value={newTeam.project_theme} onChange={(e) => setNewTeam({ ...newTeam, project_theme: e.target.value })} />
          <button onClick={createTeam}>Create</button>
        </div>
      )}

      {teams.map((team) => (
        <div key={team.id} className="team-card" style={{ border: '1px solid #ccc', padding: '16px', marginBottom: '16px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 8, right: 16, fontSize: 12 }}>
            Manager: <strong>{team.manager?.username || 'N/A'}</strong>
          </div>

          <div style={{top: 6, right:16, fontSize:12 }}>
            Team Lead: {team.team_lead?.username}
          </div>

          <h3>{team.name}</h3>
          <p><strong>Description:</strong> {team.description}</p>
          <p><strong>Project Theme:</strong> {team.project_theme}</p>

          {userRole === 'admin' && (
            <button onClick={() => deleteTeam(team.id)} style={{ marginBottom: 8, background: '#ff4d4f', color: 'white' }}>
              Delete Team
            </button>
          )}

          {userRole === 'employee' && !myTeamIds.includes(team.id) && (
            <button onClick={() => sendJoinRequest(team.id)}>Request to Join</button>
          )}


          <button onClick={() => fetchMembers(team.id)} style={{ marginTop: '8px' }}>
            View Members
          </button>

          {membersByTeam[team.id] && (
            <ul>

              {(userRole === 'admin' || (userRole === 'manager' && isManagerOfTeam(team))) && (
                <div style={{ marginTop: 10 }}>
                  <select
                    value={team.team_lead?.id || ''}
                    onChange={(e) => assignTeamLead(team.id, e.target.value)}>
                    <option value="">Select Team Lead</option>
                    {membersByTeam[team.id]?.map(member => (
                      <option key={member.user.id} value={member.user.id}>
                        {member.user.username}
                      </option>
                    ))}
                  </select>
                  <span style={{ marginLeft: 10 }}>Leader now: <strong>{team.team_lead?.username || 'N/A'}</strong></span>
                </div>
              )}

              {membersByTeam[team.id].map((member) => (
                <li key={member.id}>
                  {member.user.username} ({member.role})
                  {userRole === 'manager' && isManagerOfTeam(team) && member.user.username !== currentUser.username && (
                    <button onClick={() => requestRemoveMember(team.id, member.user.id)} style={{ marginLeft: 8 }}>Request Remove</button>
                  )}
                  {userRole === 'admin' && (
                <div style={{ marginTop: 8 }}>
                  <select value={transferTarget[member.id] || ''} onChange={(e) =>
                    setTransferTarget(prev => ({ ...prev, [member.id]: e.target.value }))}>
                    <option value="">Select New Team</option>
                    {teams.filter(t => t.id !== team.id).map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => transferMember(member.user.id, team.id, transferTarget[member.id])}
                    style={{ marginLeft: 8 }}
                  >
                    Transfer
                  </button>
                </div>
              )}
                </li>
              ))}
            </ul>
          )}

            {((userRole === 'manager' && isManagerOfTeam(team)) || userRole === 'admin') && (
            <div style={{ marginTop: 12 }}>
              <select value={selectedMember[team.id] || ''} onChange={(e) =>
                setSelectedMember(prev => ({ ...prev, [team.id]: e.target.value }))}>
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.username}</option>
                ))}
              </select>
              <button onClick={() => addMember(team.id)} style={{ marginLeft: 8 }}>Add Member</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default TeamManagement;
