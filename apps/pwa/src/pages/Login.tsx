import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { setToken } from "../lib/auth";
import { postJson } from "../lib/api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nav = useNavigate();
  const loc = useLocation() as any;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await postJson<{ token: string }>("auth/login", {
        username,
        password,
      });
      setToken(data.token);
      const to = (loc.state as any)?.from?.pathname || "/app/library";
      nav(to, { replace: true });
    } catch (e: any) {
      setError(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Log in</h1>
        <p className="muted">Welcome back to ManhwaVault</p>
        {error && (
          <p className="muted small" style={{ color: "#ff8c8c" }}>
            {error}
          </p>
        )}
        <form onSubmit={onSubmit} className="form">
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
              placeholder="••••••••"
            />
          </label>
          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="muted small">
          No account? <Link to="/register">Create one</Link>
        </p>
        <p className="muted tiny">Secure login powered by API.</p>
      </div>
    </div>
  );
}
