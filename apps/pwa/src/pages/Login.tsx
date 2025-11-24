import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      await login(username, password);
      nav("/");
    } catch {
      setErr("Login gagal");
    }
  }

  return (
    <form onSubmit={submit} style={{ maxWidth: 320 }}>
      <h2>Login</h2>
      {err && <div style={{ color: "tomato", marginBottom: 8 }}>{err}</div>}
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={inputStyle}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={inputStyle}
      />
      <button style={btnStyle} type="submit">
        Login
      </button>
      <p style={{ marginTop: 10 }}>
        Belum punya akun? <Link to="/register">Register</Link>
      </p>
    </form>
  );
}

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  margin: "6px 0",
  padding: "10px",
  border: "1px solid #333",
  background: "#222",
  color: "#fff",
  borderRadius: 8,
};

const btnStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  background: "#444",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  marginTop: 8,
};
