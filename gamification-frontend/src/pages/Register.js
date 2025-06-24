// src/pages/Register.js
import React, { useState } from "react";
import api from "./api";
import { useNavigate } from "react-router-dom";
import "../styles/Register.css"; // make sure you rename or create this
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "employee",
  });
  const [strength, setStrength] = useState(0);
  const [strengthMsg, setStrengthMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const evaluatePassword = (pwd) => {
    if (pwd.length < 6) {
      setStrength(0);
      setStrengthMsg("Too short");
    } else if (!/[A-Z]/.test(pwd)) {
      setStrength(30);
      setStrengthMsg("Add uppercase letter");
    } else if (!/[!@#$%^&*]/.test(pwd)) {
      setStrength(60);
      setStrengthMsg("Add special character");
    } else {
      setStrength(100);
      setStrengthMsg("Strong");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));

    if (name === "password") {
      evaluatePassword(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (strength < 100) {
      alert("Password does not meet strength requirements: " + strengthMsg);
      return;
    }
  
    try {
      await api.post("/register/", form);
      navigate("/login");
    } catch (err) {
      alert("Register failed: " + JSON.stringify(err.response?.data));
    }
  };

  return (
    <div className="register-page">
            <img src="rocket.png" alt="Rocket2" className="rocket2" />
            <img src="rocket.png" alt="Rocket3" className="rocket3" />
      <div className="register-container">
        <h2 className="register-title">Register</h2>
        <form className="register-form" onSubmit={handleSubmit}>
          <input
            className="register-input"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
          />
          <input
            className="register-input"
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
           <input
              className="register-input"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <span
              className="password-toggle"
              onClick={() => setShowPassword(v => !v)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          {/* strength bar */}
          <div className="strength-bar-container">
            <div
              className="strength-bar"
              style={{ width: `${strength}%` }}
            />
          </div>
          <div className="strength-text">{strengthMsg}</div>
          <select
            className="register-select"
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
          <button className="register-button" type="submit">
            Register
          </button>
        </form>
        <div className="register-footer">
          Already have an account?{" "}
          <button
            className="link-button"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
          <div className="register-page-photo">
    <img
      className="background2"
      src="/fundal.jpg"
      alt="Background2"
    />

        </div>
      </div>
    </div>
    </div>
  );
}

export default Register;
