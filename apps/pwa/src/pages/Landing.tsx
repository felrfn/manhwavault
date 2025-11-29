import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { isAuthenticated } from "../lib/auth";

export default function Landing() {
  const nav = useNavigate();
  useEffect(() => {
    if (isAuthenticated()) nav("/app/library", { replace: true });
  }, [nav]);
  return (
    <div className="landing">
      <header className="landing-header">
        <div className="brand">ManhwaVault</div>
        <nav className="actions">
          <Link className="btn ghost" to="/login">
            Log in
          </Link>
          <Link className="btn primary" to="/register">
            Create account
          </Link>
        </nav>
      </header>

      <main className="hero">
        <section className="hero-text">
          <h1>Welcome to ManhwaVault</h1>
          <p className="lead">
            Track and organize the manhwa you read, build lists, rate, and
            journal your progress. Think of it like Letterboxd, but for manhwa.
          </p>
          <div className="cta-row">
            <Link className="btn primary big" to="/register">
              Get started
            </Link>
            <Link className="btn secondary big" to="/login">
              I already have an account
            </Link>
          </div>
          <p className="note">You need an account to access the app.</p>
        </section>

        <section className="hero-art" aria-hidden>
          <div className="art-grid">
            <img src="/home1.jpeg" alt="Showcase 1" loading="lazy" />
            <img src="/home2.jpg" alt="Showcase 2" loading="lazy" />
            <img src="/home3.jpg" alt="Showcase 3" loading="lazy" />
            <img src="/home4.webp" alt="Showcase 4" loading="lazy" />
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <small>ManhwaVault @felrfn</small>
      </footer>
    </div>
  );
}
