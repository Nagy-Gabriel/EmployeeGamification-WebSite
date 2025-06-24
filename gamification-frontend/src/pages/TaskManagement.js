import React, { useEffect, useState } from 'react';
import api from './api';
import '../styles/TaskManagement.css';

function TaskManagement() {
  const [tasks, setTasks] = useState([]);
  const [userRole, setUserRole] = useState('');
  const [employees, setEmployees] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [taskFiles, setTaskFiles] = useState({});
  const [showFilesTaskId, setShowFilesTaskId] = useState(null);
  const [openRatingTaskId, setOpenRatingTaskId] = useState(null);
  const [fileNames, setFileNames] = useState({});
  const [editedTask, setEditedTask] = useState({
    title: '', description: '', status: '', priority: ''
  });
  const [newTask, setNewTask] = useState({
    title: '', description: '', assigned_to: '', status: 'todo', priority: 'medium', deadline: ''
  });

  const token = localStorage.getItem('access');

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    } catch (err) {
      console.error("Tasks fetch error:", err);
    }
  };

  const handleFileDelete = async (fileId, taskId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    try {
      await api.delete(`/task-files/${fileId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFilesForTask(taskId); // reîncarcă fișierele pentru acel task
    } catch (err) {
      console.error("Delete failed:", err.response?.data || err.message);
      alert('Failed to delete file.');
    }
  };

  const toggleShowFiles = async (taskId) => {
    if (showFilesTaskId === taskId) {
      setShowFilesTaskId(null); // închide
    } else {
      if (!taskFiles[taskId]) {
        await fetchFilesForTask(taskId);
      }
      setShowFilesTaskId(taskId); // deschide
    }
  };
  
  const fetchFilesForTask = async (taskId) => {
    try {
      const res = await api.get(`/task-files/?task=${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTaskFiles(prev => ({ ...prev, [taskId]: res.data }));
    } catch (err) {
      console.error("Failed to fetch files", err);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/profile/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserRole(res.data.role);
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    };
    
    const fetchEmployees = async () => {
      try {
        const res = await api.get('/employees/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmployees(res.data);
      } catch (err) {
        console.error("Employees fetch error:", err);
      }
    };

    fetchProfile();
    fetchTasks();
    fetchEmployees();
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token],);

  // const requestVerification = async (taskId) => {
  //   await api.patch(`/tasks/${taskId}/`, { status: 'in_verification' }, {
  //     headers: { Authorization: `Bearer ${token}` },
  //   });
  //   window.location.reload();
  // };

  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setEditedTask({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
    });
  };

  
  const saveEdit = async () => {
    await api.patch(`/tasks/${editingTaskId}/`, editedTask, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setEditingTaskId(null);
    window.location.reload();
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      await api.patch(`/tasks/${taskId}/`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks();
    } catch (err) {
      alert('Failed to update task status.');
      console.error(err);
    }
  };

  const deleteTask = async (id) => {
    await api.delete(`/tasks/${id}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    window.location.reload();
  };

  const createTask = async () => {
    try {
      await api.post('/tasks/', newTask, {
        headers: { Authorization: `Bearer ${token}` },
        
      });
      setNewTask({ title: '', description: '', assigned_to: '', status: 'todo', priority: 'medium', deadline: '' });
      window.location.reload();
    } catch (err) {
      console.error("❌ Error details:", err.response?.data);
      alert("Error: " + JSON.stringify(err.response?.data));
    }
  };

  const handleFileUpload = async (taskId, e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append('file', file);
    formData.append('task_id', taskId);
    formData.append('name', file.name); // sau fileNames[taskId] dacă ai input separat
  
    try {
      const response = await api.post('/task-files/', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
  
      console.log('✅ Upload response:', response.data);
      alert('File uploaded successfully!');
      fetchFilesForTask(taskId);
    } catch (err) {
      console.error('❌ Upload failed:', err.response?.data || err.message);
      alert('Upload failed');
    }
  };
  
  const updateRating = (taskId, value) => {
    setTasks(prev =>
      prev.map(t => t.id === taskId ? { ...t, rating: value } : t)
    );
  };
  
  const updateFeedback = (taskId, value) => {
    setTasks(prev =>
      prev.map(t => t.id === taskId ? { ...t, feedback: value } : t)
    );
  };
  
  const saveRatingFeedback = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    try {
      await api.patch(`/tasks/${taskId}/`, {
        rating: task.rating,
        feedback: task.feedback,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Feedback saved!');
      fetchTasks();
    } catch (err) {
      console.error('Error saving feedback:', err);
      alert('Failed to save feedback');
    }
  };
  
  const toggleRatingForm = (taskId) => {
    setOpenRatingTaskId(prev => prev === taskId ? null : taskId);
  };


  return (
    <div className="container">
      <h2>Task List</h2>

      {['admin', 'manager'].includes(userRole) && (
        <div className="task-card">
          <h3>Create New Task</h3>
          <div className="input-group">
            <input placeholder="Title" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />
            <input placeholder="Description" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} />
            <select value={newTask.assigned_to} onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}>
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.username} (ID: {emp.id})</option>
              ))}
            </select>
            <input type="date" value={newTask.deadline} onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })} />
            <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <button className="btn-blue" onClick={createTask}>Create</button>
          </div>
        </div>
      )}

{tasks.map(task => (
  <div key={task.id} className="task-card">
    <h3>{task.title}</h3>
    <p><em>{task.description}</em></p>
    <p>Priority: {task.priority}</p>
    <p>Status: <span className="status">{task.status}</span></p>
    <p>Deadline: {task.deadline}</p>
    <p>Assigned to: {task.assigned_to?.username}</p>

    {/* Show/Hide Files Button */}
    <button className="btn-gray" onClick={() => toggleShowFiles(task.id)}>
      {showFilesTaskId === task.id ? 'Hide Files' : 'Show Files'}
    </button>

    {/* Show files only if toggled */}
    {showFilesTaskId === task.id && (
      <div className="file-list" style={{ marginTop: '10px' }}>
        <h4>Uploaded Files:</h4>
        {taskFiles[task.id]?.length > 0 ? (
          taskFiles[task.id].map(file => (
            <div key={file.id} style={{ marginBottom: '5px' }}>
              <a href={file.file} target="_blank" rel="noopener noreferrer">
                {file.name || 'Unnamed File'}
              </a>
              <button
                className="btn-red"
                style={{ marginLeft: '10px' }}
                onClick={() => handleFileDelete(file.id, task.id)}
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <p>No files uploaded.</p>
        )}

        {/* Upload section */}
        <div style={{ marginTop: '10px' }}>
          <input
            type="text"
            placeholder="File name"
            value={fileNames[task.id] || ''}
            onChange={(e) => setFileNames(prev => ({ ...prev, [task.id]: e.target.value }))}
          />
          <input type="file" onChange={(e) => handleFileUpload(task.id, e)} />
        </div>
      </div>
    )}

    {/* Buttons for task control */}
    <div className="button-group" style={{ marginTop: '15px' }}>
      {userRole === 'employee' && task.status === 'todo' && (
        <button className="btn-blue" onClick={() => updateTaskStatus(task.id, 'in_progress')}>Start Task</button>
      )}

      {userRole === 'employee' && task.status === 'in_progress' && (
        <button className="btn-green" onClick={() => updateTaskStatus(task.id, 'in_verification')}>Finish Task</button>
      )}

      {['admin', 'manager'].includes(userRole) && (
        <>
          <button className="btn-yellow" onClick={() => startEditing(task)}>Edit</button>
          <button className="btn-red" onClick={() => deleteTask(task.id)}>Delete</button>
        </>
      )}
    </div>

    {/* Edit task form */}
    {editingTaskId === task.id && (
      <div className="input-group" style={{ marginTop: '10px' }}>
        <input value={editedTask.title} onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })} />
        <input value={editedTask.description} onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })} />
        <select value={editedTask.status} onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value })}>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="in_verification">In Verification</option>
          <option value="done">Done</option>
        </select>
        <select value={editedTask.priority} onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value })}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button className="btn-blue" onClick={saveEdit}>Save</button>
        <button className="btn-gray" onClick={() => setEditingTaskId(null)}>Cancel</button>
      </div>
    )}

      {['admin', 'manager'].includes(userRole) && (task.status === 'in_verification' || task.status === 'done') && (
        <>
        <button
          className="btn-gray"
          onClick={() => toggleRatingForm(task.id)}
        >
          {openRatingTaskId === task.id ? 'Hide Rating' : 'Give Rating'}
        </button>

        {openRatingTaskId === task.id && (
          <div className="rating-form" style={{ marginTop: '10px' }}>
            <label>Rating:</label>
            <select
              value={task.rating || ''}
              onChange={(e) => updateRating(task.id, e.target.value)}
            >
              <option value="">Select...</option>
              {[1, 2, 3, 4, 5].map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>

            <label>Feedback:</label>
            <textarea
              value={task.feedback || ''}
              onChange={(e) => updateFeedback(task.id, e.target.value)}
            />

            <button className="btn-green" onClick={() => saveRatingFeedback(task.id)}>
              Save Feedback
            </button>
          </div>
        )}
      </>
      )}
      {userRole === 'employee' && task.rating && (
  <div className="feedback-view">
    <p><strong>Rating:</strong> {task.rating}/5</p>
    <p><strong>Feedback:</strong> {task.feedback}</p>
  </div>
)}


  </div>
))}
    </div>
  );
}

export default TaskManagement;
