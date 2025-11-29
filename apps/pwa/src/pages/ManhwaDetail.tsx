import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getJson, postJson, patchJson } from "../lib/api";
import { getToken } from "../lib/auth";
import { useToast } from "../lib/toast";

type Detail = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  coverUrl?: string | null;
  genres?: string[];
  isFavorite?: boolean;
  readingStatus?: string | null;
  progress?: number | null;
};

type Comment = {
  id: string;
  body: string;
  createdAt: string;
  user: { username: string; displayName?: string | null };
};

export default function ManhwaDetail() {
  const { slug } = useParams();
  const toast = useToast();
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteBusy, setFavoriteBusy] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentBody, setCommentBody] = useState("");
  const [commentBusy, setCommentBusy] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const token = getToken();
        const safeSlug = String(slug);
        const d = await getJson<Detail>(
          `/manhwa/${encodeURIComponent(safeSlug)}`,
          undefined,
          token ? { Authorization: `Bearer ${token}` } : undefined
        );
        if (!cancelled) setDetail(d);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load detail");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    // lazy load comments after detail loaded
    if (!detail || !slug || comments) return;
    let cancelled = false;
    async function loadComments() {
      try {
        setCommentsLoading(true);
        const safeSlug = String(slug);
        const list = await getJson<Comment[]>(
          `/manhwa/${encodeURIComponent(safeSlug)}/comments`
        );
        if (!cancelled) setComments(list);
      } catch (e) {
        if (!cancelled) setComments([]); // silent fail
      } finally {
        if (!cancelled) setCommentsLoading(false);
      }
    }
    loadComments();
    return () => {
      cancelled = true;
    };
  }, [detail, slug, comments]);

  async function toggleFavorite() {
    if (!detail || favoriteBusy) return;
    const token = getToken();
    if (!token) return; // require auth
    try {
      setFavoriteBusy(true);
      const previous = detail.isFavorite ?? false;
      // Optimistic UI
      setDetail((d) => (d ? { ...d, isFavorite: !previous } : d));

      const res = await postJson<{ isFavorite: boolean }>(
        `/manhwa/${detail.slug}/favorite`,
        {},
        { Authorization: `Bearer ${token}` }
      );
      // Align with server result, then show success feedback
      setDetail((d) => (d ? { ...d, isFavorite: res.isFavorite } : d));
      toast.success(
        res.isFavorite ? "Added to favorites" : "Removed from favorites"
      );
    } catch (e) {
      // Revert on failure and inform user
      setDetail((d) =>
        d ? { ...d, isFavorite: !(d.isFavorite ?? false) } : d
      );
      const msg = e instanceof Error ? e.message : "Failed to update favorite";
      toast.error(msg);
    } finally {
      setFavoriteBusy(false);
    }
  }

  async function changeStatus(newStatus: string) {
    if (!detail || statusBusy) return;
    const token = getToken();
    if (!token) return;
    try {
      setStatusBusy(true);
      // Optimistic UI
      setDetail((d) => (d ? { ...d, readingStatus: newStatus } : d));

      const updated = await patchJson<any>(
        `/manhwa/${detail.slug}/status`,
        { status: newStatus },
        { Authorization: `Bearer ${token}` }
      );
      setDetail((d) =>
        d
          ? {
              ...d,
              readingStatus: updated.status,
              progress: updated.progress,
            }
          : d
      );
      toast.success("Status updated");
    } catch (e) {
      // Revert and inform user
      const prevStatus = detail.readingStatus || "";
      setDetail((d) => (d ? { ...d, readingStatus: prevStatus } : d));
      const msg = e instanceof Error ? e.message : "Failed to update status";
      toast.error(msg);
    } finally {
      setStatusBusy(false);
    }
  }

  async function submitComment() {
    if (!detail || !commentBody.trim() || commentBusy) return;
    const token = getToken();
    if (!token) return;
    try {
      setCommentBusy(true);
      const created = await postJson<Comment>(
        `/manhwa/${detail.slug}/comments`,
        { body: commentBody.trim() },
        { Authorization: `Bearer ${token}` }
      );
      setCommentBody("");
      setComments((prev) => (prev ? [created, ...prev] : [created]));
    } catch (e) {
      // ignore
    } finally {
      setCommentBusy(false);
    }
  }

  if (loading) {
    return (
      <div
        className="container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 220,
        }}
      >
        <img
          src="/loading.gif"
          alt="Loading..."
          width={48}
          height={48}
          style={{ display: "block" }}
        />
      </div>
    );
  }
  if (error) {
    return (
      <div className="container">
        <p style={{ color: "tomato" }}>{error}</p>
      </div>
    );
  }
  if (!detail) return null;

  const desc = detail.description || "Tidak ada deskripsi.";
  const truncated =
    !expanded && desc.length > 260 ? desc.slice(0, 260) + "…" : desc;
  const statuses = ["PLANNING", "READING", "COMPLETED", "PAUSED", "DROPPED"];

  return (
    <div className="manhwa-detail container">
      <div className="md-layout">
        <div className="md-cover-wrap">
          {detail.coverUrl ? (
            <img
              src={detail.coverUrl}
              alt={detail.title}
              className="md-cover"
            />
          ) : (
            <div className="md-cover placeholder" />
          )}
        </div>
        <div className="md-body">
          <h1 className="md-title">{detail.title}</h1>
          <div className="md-actions">
            <button
              className={`icon-btn heart ${detail.isFavorite ? "active" : ""}`}
              onClick={toggleFavorite}
              disabled={favoriteBusy}
              aria-label="Toggle favorite"
            >
              {detail.isFavorite ? "❤" : "♡"}
            </button>
            <select
              className="status-select"
              value={detail.readingStatus || ""}
              onChange={(e) => changeStatus(e.target.value || "PLANNING")}
              disabled={statusBusy}
            >
              <option value="">Status…</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className={`md-description ${expanded ? "expanded" : ""}`}>
            <p>{truncated}</p>
            {desc.length > 260 && (
              <button
                className="link-btn"
                onClick={() => setExpanded((x) => !x)}
                aria-label={expanded ? "Tutup" : "Buka"}
              >
                {expanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>
          {detail.genres && detail.genres.length > 0 && (
            <div className="md-genres">
              {detail.genres.map((g) => (
                <span key={g} className="genre-chip">
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <section className="md-comments">
        <h2>Komentar</h2>
        <div className="comment-form">
          <textarea
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
            placeholder="Tulis komentar..."
            rows={3}
            disabled={commentBusy}
          />
          <button
            className="btn primary"
            onClick={submitComment}
            disabled={commentBusy || !commentBody.trim()}
          >
            Kirim
          </button>
        </div>
        {commentsLoading && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 60,
            }}
          >
            <img
              src="/loading.gif"
              alt="Loading..."
              width={32}
              height={32}
              style={{ display: "block" }}
            />
          </div>
        )}
        {comments && comments.length === 0 && (
          <p className="muted">Belum ada komentar.</p>
        )}
        <ul className="comment-list">
          {comments?.map((c) => (
            <li key={c.id} className="comment-item">
              <p className="comment-meta">
                <strong>{c.user.displayName || c.user.username}</strong>{" "}
                <span className="muted small">
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
              </p>
              <p className="comment-body">{c.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
