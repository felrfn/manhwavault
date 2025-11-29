import { useEffect, useState } from "react";
import { getJson, getJsonEnvelope, patchJson } from "../lib/api";
import { getToken } from "../lib/auth";
import { useToast } from "../lib/toast";

type Me = { id: string; username: string; displayName?: string };
type CommentItem = {
  id: string;
  body: string;
  createdAt: string;
  manhwa: { id: string; slug: string; title: string; coverUrl?: string | null };
};
type StatusItem = {
  id: string;
  slug: string;
  title: string;
  coverUrl?: string | null;
  status?: string;
  progress?: number;
};
type Envelope<T> = {
  success: boolean;
  data: T;
  meta?: { page: number; limit: number; total: number; totalPages: number };
};

export default function Profile() {
  const toast = useToast();
  const [me, setMe] = useState<Me | null>(null);
  const [recent, setRecent] = useState<CommentItem[]>([]);
  const [diary, setDiary] = useState<StatusItem[]>([]);
  const [paused, setPaused] = useState<StatusItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const token = getToken();
        const user = await getJson<Me>(
          "/auth/me",
          undefined,
          token ? { Authorization: `Bearer ${token}` } : undefined
        );
        if (cancelled) return;
        setMe(user);
        setDisplayName(user.displayName || "");
        // recent activity (comments) limit 4
        const commentsEnv = await getJsonEnvelope<Envelope<CommentItem[]>>(
          `/user/${encodeURIComponent(user.username)}/comments`,
          { page: 1, limit: 4 }
        );
        if (!cancelled)
          setRecent(Array.isArray(commentsEnv.data) ? commentsEnv.data : []);
        // diary COMPLETED
        const diaryEnv = await getJsonEnvelope<Envelope<StatusItem[]>>(
          `/user/${encodeURIComponent(user.username)}/status/COMPLETED`,
          { page: 1, limit: 12 }
        );
        if (!cancelled)
          setDiary(Array.isArray(diaryEnv.data) ? diaryEnv.data : []);
        // continue reading PAUSED
        const pausedEnv = await getJsonEnvelope<Envelope<StatusItem[]>>(
          `/user/${encodeURIComponent(user.username)}/status/PAUSED`,
          { page: 1, limit: 12 }
        );
        if (!cancelled)
          setPaused(Array.isArray(pausedEnv.data) ? pausedEnv.data : []);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load profile");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="container" style={{ paddingTop: 12 }}>
      {me && (
        <button
          className="btn ghost"
          style={{ padding: 0, fontSize: 24, fontWeight: 700 }}
          onClick={() => setShowModal(true)}
        >
          Hallo {me.displayName || me.username}
        </button>
      )}
      {error && (
        <p className="muted small" style={{ color: "#ff8c8c" }}>
          {error}
        </p>
      )}
      {loading && (
        <p className="muted" style={{ marginTop: 12 }}>
          Loading…
        </p>
      )}

      {/* Recent Activity */}
      <section style={{ marginTop: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 20 }}>Activity</h2>
          <a
            href="/app/profile/activity"
            style={{
              fontSize: 12,
              textDecoration: "none",
              color: "var(--primary)",
            }}
          >
            See more →
          </a>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(90px,1fr))",
            gap: 10,
            marginTop: 12,
          }}
        >
          {recent.map((c) => (
            <a
              key={c.id}
              href={`/app/manhwa/${c.manhwa.slug}`}
              style={{
                position: "relative",
                borderRadius: 10,
                overflow: "hidden",
                background: "#222",
                height: 130,
                display: "flex",
                alignItems: "flex-end",
              }}
            >
              {c.manhwa.coverUrl && (
                <img
                  src={c.manhwa.coverUrl}
                  alt={c.manhwa.title}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              )}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.15))",
                }}
              />
              <div style={{ position: "relative", padding: 6 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 10,
                    lineHeight: 1.3,
                    color: "#fff",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {c.body}
                </p>
              </div>
            </a>
          ))}
          {!loading && recent.length === 0 && (
            <p className="muted" style={{ fontSize: 12 }}>
              Belum ada aktivitas.
            </p>
          )}
        </div>
      </section>

      {/* Diary (COMPLETED) */}
      <section style={{ marginTop: 32 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 20 }}>Diary</h2>
          <a
            href="/app/profile/diary"
            style={{
              fontSize: 12,
              textDecoration: "none",
              color: "var(--primary)",
            }}
          >
            See more →
          </a>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(90px,1fr))",
            gap: 10,
            marginTop: 12,
          }}
        >
          {diary.map((d) => (
            <a
              key={d.id}
              href={`/app/manhwa/${d.slug}`}
              style={{
                position: "relative",
                borderRadius: 10,
                overflow: "hidden",
                background: "#222",
                height: 130,
                display: "flex",
                alignItems: "flex-end",
              }}
            >
              {d.coverUrl ? (
                <img
                  src={d.coverUrl}
                  alt={d.title}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{ position: "absolute", inset: 0, background: "#222" }}
                />
              )}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.15))",
                }}
              />
            </a>
          ))}
          {!loading && diary.length === 0 && (
            <p className="muted" style={{ fontSize: 12 }}>
              Belum ada yang selesai.
            </p>
          )}
        </div>
      </section>

      {/* Continue Reading (PAUSED) */}
      <section style={{ marginTop: 32, marginBottom: 48 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 20 }}>Continue Reading</h2>
          <a
            href="/app/profile/paused"
            style={{
              fontSize: 12,
              textDecoration: "none",
              color: "var(--primary)",
            }}
          >
            See more →
          </a>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(90px,1fr))",
            gap: 10,
            marginTop: 12,
          }}
        >
          {paused.map((p) => (
            <a
              key={p.id}
              href={`/app/manhwa/${p.slug}`}
              style={{
                position: "relative",
                borderRadius: 10,
                overflow: "hidden",
                background: "#222",
                height: 130,
                display: "flex",
                alignItems: "flex-end",
              }}
            >
              {p.coverUrl ? (
                <img
                  src={p.coverUrl}
                  alt={p.title}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{ position: "absolute", inset: 0, background: "#222" }}
                />
              )}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.15))",
                }}
              />
            </a>
          ))}
          {!loading && paused.length === 0 && (
            <p className="muted" style={{ fontSize: 12 }}>
              Tidak ada yang paused.
            </p>
          )}
        </div>
      </section>
      {showModal && me && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#00000088",
            display: "grid",
            placeItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 500,
              background: "var(--panel)",
              border: "1px solid #ffffff22",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2 style={{ margin: 0 }}>Edit Profile</h2>
              <button className="btn ghost" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
            <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span className="muted small">Username</span>
                <input value={me.username} disabled style={{ opacity: 0.6 }} />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span className="muted small">Display Name</span>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </label>
              <div>
                <button
                  className="btn primary"
                  disabled={saving}
                  onClick={async () => {
                    const token = getToken();
                    if (!token) return;
                    try {
                      setSaving(true);
                      const updated = await patchJson<Me>(
                        "/auth/profile",
                        { displayName: displayName || null },
                        { Authorization: `Bearer ${token}` }
                      );
                      setMe((prev) =>
                        prev
                          ? { ...prev, displayName: updated.displayName }
                          : prev
                      );
                      toast.success("Profile updated");
                    } catch (e) {
                      const msg =
                        e instanceof Error
                          ? e.message
                          : "Failed to update profile";
                      toast.error(msg);
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  Save
                </button>
              </div>
              <hr style={{ borderColor: "#ffffff22" }} />
              <button
                className="btn danger"
                style={{ marginTop: 8 }}
                onClick={() => {
                  import("../lib/auth").then(({ logout }) => {
                    logout();
                    window.location.href = "/";
                  });
                }}
              >
                Log Out
              </button>
              <h3 style={{ margin: 0 }}>Change Password</h3>
              <label style={{ display: "grid", gap: 6 }}>
                <span className="muted small">Old Password</span>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span className="muted small">New Password</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span className="muted small">Confirm New Password</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </label>
              <div>
                <button
                  className="btn secondary"
                  disabled={
                    saving ||
                    !oldPassword ||
                    !newPassword ||
                    newPassword !== confirmPassword
                  }
                  onClick={async () => {
                    if (newPassword !== confirmPassword) {
                      toast.error("Passwords do not match");
                      return;
                    }
                    const token = getToken();
                    if (!token) return;
                    try {
                      setSaving(true);
                      await patchJson(
                        "/auth/password",
                        { oldPassword, newPassword },
                        { Authorization: `Bearer ${token}` }
                      );
                      setOldPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                      toast.success("Password updated");
                    } catch (e) {
                      const msg =
                        e instanceof Error
                          ? e.message
                          : "Failed to update password";
                      toast.error(msg);
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
