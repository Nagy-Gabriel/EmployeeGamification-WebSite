import React, { useEffect, useState } from 'react';
import api from './api';
import '../styles/Reports.css';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [form, setForm] = useState({
    title: '',
    message: '',
    report_type: 'feedback',
  });
  const [userRole, setUserRole] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/profile/')
      .then(res => setUserRole(res.data.role))
      .catch(() => setUserRole(null));

    fetchReports();
  }, []);

  const fetchReports = () => {
    api.get('/internal-reports/')
      .then(res => setReports(res.data))
      .catch(err => console.error('Fetch error:', err));
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title || !form.message) {
      setError('Title and message are required.');
      return;
    }

    try {
      await api.post('/internal-reports/', form);
      setForm({ title: '', message: '', report_type: 'feedback' });
      fetchReports();
    } catch (err) {
      console.error('Send error:', err);
      setError('Could not send report.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
  
    try {
      await api.delete(`/internal-reports/${id}/`);
      fetchReports();  // refresh list
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete the report.");
    }
  };
  
  const handleRespond = async (id) => {
    const response = prompt('Enter your reply:');
    if (!response) return;

    try {
      await api.patch(`/internal-reports/${id}/`, {
        response,
        status: 'resolved',
      });
      fetchReports();
    } catch {
      alert('Failed to send response.');
    }
  };

  return (
    <div className="reports-page">
      <h2>Internal Reports</h2>

      <form className="report-form" onSubmit={handleSubmit}>
        <h3>Submit a Report</h3>
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
        />
        <textarea
          name="message"
          placeholder="Describe the issue, idea or feedback..."
          value={form.message}
          onChange={handleChange}
        />
        <select name="report_type" value={form.report_type} onChange={handleChange}>
          <option value="feedback">Feedback</option>
          <option value="issue">Issue</option>
          <option value="idea">Idea</option>
          <option value="other">Other</option>
        </select>
        {error && <p className="form-error">{error}</p>}
        <button type="submit">Send</button>
      </form>

      <hr />

      <h3>All Reports</h3>
      <table className="report-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Status</th>
            <th>Sender</th>
            <th>Submitted</th>
            <th>Response</th>
            {['admin', 'manager'].includes(userRole) && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {reports.map(r => (
            <tr key={r.id}>
              <td>{r.title}</td>
              <td>{r.report_type}</td>
              <td>{r.status}</td>
              <td>{r.sender_username}</td>
              <td>{new Date(r.created_at).toLocaleString()}</td>
              <td>{r.response || '-'}</td>
              {['admin', 'manager'].includes(userRole) && (
                <td>
                  {r.status !== 'resolved' && (
                    <button onClick={() => handleRespond(r.id)}>
                      Respond
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(r.id)}
                    style={{ marginLeft: 10, backgroundColor: 'red', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px' }}
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
