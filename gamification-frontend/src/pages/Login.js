import React, { useState } from 'react';
import {useNavigate } from 'react-router-dom';
import api from './api';
import '../styles/Login.css';
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Trimitere login la backend
      const res = await api.post('/login/', { username, password });
      console.log("✅ Login answer:", res.data);

      // Salvează token-urile JWT în localStorage
      localStorage.setItem('access', res.data.access);
      localStorage.setItem('refresh', res.data.refresh);

      // Salvează și alte date utile
      localStorage.setItem('user_id', res.data.user_id);
      localStorage.setItem('username', res.data.username);
      localStorage.setItem('role', res.data.role);

      // Redirect după login
      navigate('/dashboard');  // schimbă ruta după cum vrei
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      alert('Login failed: ' + (err.response?.data?.error || 'Please check credentials.'));
    }
  };

  return (
    <div className="login-page">
    <img
      className="background"
      src="/fundal.jpg"
      alt="Background"

    />

    <div className="login-page">
      <img src="rocket.png" alt="Rocket" className="rocket" />
      <div className="login-container">
        <div className="login-box">
          <h2 className="login-title">Login</h2>
          <form onSubmit={handleLogin} className="login-form">
            <input
              className="login-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
              autoComplete="username"
            />
            <input
              className="login-input"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <span
              className="password-toggle2"
              onClick={() => setShowPassword(v => !v)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
            <button type="submit" className="login-button">Launch 🚀</button>
          </form>
          <div className="login-footer">
            New account? <span onClick={() => navigate('/register')}>Register</span>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default Login;
