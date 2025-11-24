import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      await register(username, password, displayName || undefined);
      nav("/");
    } catch {
      setErr("Register gagal");
    }
  }

  return (
    <form onSubmit={submit} style={{ maxWidth: 320 }}>
      <h2>Register</h2>
      {err && <div style={{ color: "tomato", marginBottom: 8 }}>{err}</div>}
      <input
        style={inputStyle}
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        style={inputStyle}
        placeholder="Display Name (opsional)"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
      />
      <input
        style={inputStyle}
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button style={btnStyle} type="submit">
        Register
      </button>
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
