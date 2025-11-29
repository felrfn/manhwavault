import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { setToken } from "../lib/auth";
import { postJson } from "../lib/api";

export default function Register() {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nav = useNavigate();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Register
      await postJson<{ id: string; username: string }>("auth/register", {
        username,
        password,
        displayName: displayName || undefined,
      });
      // Then login to obtain token
      const login = await postJson<{ token: string }>("auth/login", {
        username,
        password,
      });
      setToken(login.token);
      nav("/app", { replace: true });
    } catch (e: any) {
      setError(e.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create account</h1>
        <p className="muted">Join ManhwaVault and start tracking</p>
        {error && (
          <p className="muted small" style={{ color: "#ff8c8c" }}>
            {error}
          </p>
        )}
        <form onSubmit={onSubmit} className="form">
          <label>
            <span>Display name</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name (optional)"
            />
          </label>
          <label>
            <span>Username</span>
            <input
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="yourusername"
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
            />
          </label>
          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>
        <p className="muted small">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
