import { useEffect, useRef, useState } from "react";
import { getJsonEnvelope, getJson } from "../lib/api";
import { getToken } from "../lib/auth";

type Me = { id: string; username: string; displayName?: string };
type CommentItem = {
  id: string;
  body: string;
  createdAt: string;
  manhwa: { id: string; title: string; coverUrl?: string | null };
};
type CommentsEnvelope = {
  success: boolean;
  data: CommentItem[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export default function ProfileActivity() {
  const [username, setUsername] = useState<string | null>(null);
  const [items, setItems] = useState<CommentItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const hasMore = page < totalPages;

  useEffect(() => {
    let cancelled = false;
    async function loadMe() {
      try {
        const token = getToken();
        const me = await getJson<Me>(
          "/auth/me",
          undefined,
          token ? { Authorization: `Bearer ${token}` } : undefined
        );
        if (!cancelled) setUsername(me.username);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load user");
      }
    }
    loadMe();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    async function fetchComments() {
      setLoading(true);
      setError(null);
      try {
        const res = await getJsonEnvelope<CommentsEnvelope>(
          username ? `/user/${encodeURIComponent(username)}/comments` : "",
          { page }
        );
        if (cancelled) return;
        const list = Array.isArray(res?.data) ? res.data : [];
        const nextTotalPages = Number(res?.meta?.totalPages ?? 1);
        setItems((prev) => (page === 1 ? list : [...prev, ...list]));
        setTotalPages(nextTotalPages > 0 ? nextTotalPages : 1);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load activity");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchComments();
    return () => {
      cancelled = true;
    };
  }, [username, page]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !loading && hasMore) {
          setPage((p) => p + 1);
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loading, hasMore]);

  return (
    <div className="container" style={{ paddingTop: 12 }}>
      <h1>Activity</h1>
      {error && (
        <p className="muted small" style={{ color: "#ff8c8c" }}>
          {error}
        </p>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
          gap: 12,
          marginTop: 16,
        }}
      >
        {items.map((c) => (
          <div
            key={c.id}
            style={{
              position: "relative",
              borderRadius: 12,
              overflow: "hidden",
              background: "#222",
              height: 150,
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
                  "linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0.15))",
              }}
            />
            <div style={{ position: "relative", padding: 8 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  lineHeight: 1.3,
                  color: "#fff",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {c.body}
              </p>
            </div>
          </div>
        ))}
      </div>
      {loading && (
        <p className="muted" style={{ marginTop: 12 }}>
          Loading…
        </p>
      )}
      <div ref={sentinelRef} style={{ height: 1 }} />
    </div>
  );
}
