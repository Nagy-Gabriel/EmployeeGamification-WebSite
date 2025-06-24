// src/pages/AbsenceRequests.js

import React, { useState, useEffect } from 'react';
import api from './api';
import '../styles/AbsenceCalendar.css';

export default function AbsenceCalendar() {
  const [absences, setAbsences] = useState([]);
  const [formData, setFormData] = useState({
    absence_type: 'VAC',
    start_date: '',
    end_date: '',
    reason: '',
  });
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1) Fetch the logged-in user's role
  useEffect(() => {
    api.get('/profile/')
      .then(res => {
        const role = res.data.role;
        setUserRole(role);
      })
      .catch(() => setUserRole(null));
  }, []);

  // 2) Fetch all absence requests
  const fetchAbsences = () => {
    api.get('/absences/')
      .then(res => setAbsences(res.data))
      .catch(err => console.error('Error fetching absences:', err.response || err));
  };
  useEffect(fetchAbsences, []);

  // 3) Handle form inputs for new request
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  // 4) Submit a new absence request (employees only)
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    const { absence_type, start_date, end_date, reason } = formData;
    if (!start_date || !end_date) {
      setError('Please select both Start Date and End Date.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/absences/', { absence_type, start_date, end_date, reason });
      setFormData({
        absence_type: 'VAC',
        start_date: '',
        end_date: '',
        reason: '',
      });
      fetchAbsences();
    } catch (err) {
      console.error('Submit error:', err.response || err);
      let msg = 'Unable to submit. Please try again.';
      if (err.response?.data) {
        const data = err.response.data;
        if (data.detail) {
          msg = data.detail;
        } else {
          msg = Object.entries(data)
            .map(([field, arr]) => `${field}: ${arr.join(' ')}`)
            .join(' | ');
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDeny = async (id, newStatus) => {
    const promptText = newStatus === 'APPROVED'
      ? 'Enter approval comment (optional):'
      : 'Enter reason for denial:';
  
    const managerComment = window.prompt(promptText, '');
  
    if (newStatus === 'DENIED' && (!managerComment || managerComment.trim() === '')) {
      alert('A reason is required to deny a request.');
      return;
    }
  
    try {
      await api.patch(`/absences/${id}/`, {
        status: newStatus,
        manager_comment: managerComment.trim(),
      });
    
     
      setAbsences(prev =>
        prev.map(abs =>
          abs.id === id
            ? { ...abs, status: newStatus, manager_comment: managerComment.trim() }
            : abs
        )
      );
     
    } catch (err) {
      console.error('Error updating status:', err.response || err);
      alert('Could not update status. Please try again.');
    }
  };
  

  return (
    <div className="ar-page">
      <h2>Absence Requests</h2>

      {/* Only employees (not managers/admins) see the submission form */}
      {userRole !== 'manager' && userRole !== 'admin' && (
        <form onSubmit={handleSubmit} className="ar-form">
          <h3>Request Absence</h3>

          <label>
            Type:
            <select
              name="absence_type"
              value={formData.absence_type}
              onChange={handleChange}
            >
              <option value="VAC">Vacation</option>
              <option value="SICK">Sick Leave</option>
              <option value="PERS">Personal Leave</option>
            </select>
          </label>

          <label>
            Start Date:
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
            />
          </label>

          <label>
            End Date:
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
            />
          </label>

          <label>
            Reason (optional):
            <textarea
              name="reason"
              rows={2}
              value={formData.reason}
              onChange={handleChange}
            />
          </label>

          {error && <p className="ar-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Submitting…' : 'Submit Request'}
          </button>
        </form>
      )}

      <hr />

      {/* Table of all requests (employees see only their own; managers/admin see all) */}
      <table className="ar-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Type</th>
            <th>Dates</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Manager Comment</th>
            {(userRole === 'manager' || userRole === 'admin') && <th>Actions</th>}
          </tr>
        </thead>
                <tbody>
          {absences.map(a => (
            <tr key={a.id}>
              <td>{a.employee_username}</td>
              <td>{a.absence_type}</td>
              <td>{a.start_date} → {a.end_date}</td>
              <td>{a.reason || '-'}</td>
              <td>{a.status}</td>
              <td>{a.manager_comment || '-'}</td>
              
              {(userRole === 'manager' || userRole === 'admin') && a.status === 'PENDING' && (
                <td>
                  <button
                    onClick={() => handleApproveDeny(a.id, 'APPROVED')}
                    className="ar-approve"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleApproveDeny(a.id, 'DENIED')}
                    className="ar-deny"
                  >
                    Deny
                  </button>
                </td>
              )}
              {(userRole === 'manager' || userRole === 'admin') && a.status !== 'PENDING' && <td>✓</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
