import { useEffect, useRef, useState } from "react";
import { getJson, getJsonEnvelope } from "../lib/api";
import { getToken } from "../lib/auth";

type Me = { id: string; username: string };
type Item = {
  id: string;
  slug: string;
  title: string;
  coverUrl?: string | null;
};
type ListEnvelope = {
  success: boolean;
  data: Item[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export default function ProfileDiary() {
  const [username, setUsername] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
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
    async function fetchPage() {
      setLoading(true);
      setError(null);
      try {
        const res = await getJsonEnvelope<ListEnvelope>(
          username
            ? `/user/${encodeURIComponent(username)}/status/COMPLETED`
            : "",
          { page }
        );
        if (cancelled) return;
        const list = Array.isArray(res?.data) ? res.data : [];
        setItems((prev) => (page === 1 ? list : [...prev, ...list]));
        setTotalPages(Number(res?.meta?.totalPages ?? 1));
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchPage();
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
        if (first.isIntersecting && !loading && hasMore) setPage((p) => p + 1);
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loading, hasMore]);

  return (
    <div className="container" style={{ paddingTop: 12 }}>
      <h1>Diary</h1>
      {error && (
        <p className="muted small" style={{ color: "#ff8c8c" }}>
          {error}
        </p>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(90px,1fr))",
          gap: 10,
          marginTop: 12,
        }}
      >
        {items.map((d) => (
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
