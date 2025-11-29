import { useEffect, useRef, useState } from "react";
import { getJsonEnvelope } from "../lib/api";

type ReviewItem = {
  id: string;
  body: string;
  createdAt: string;
  user: { id: string; username: string; displayName?: string | null };
  manhwa: { id: string; slug: string; title: string; coverUrl?: string | null };
};

type ListEnvelope = {
  success: boolean;
  data: ReviewItem[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export default function Review() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const hasMore = page < totalPages;

  useEffect(() => {
    let cancelled = false;
    async function fetchPage() {
      setLoading(true);
      setError(null);
      try {
        const res = await getJsonEnvelope<ListEnvelope>("/comments", { page });
        if (cancelled) return;
        const list = Array.isArray(res?.data) ? res.data : [];
        const nextTotalPages = Number(res?.meta?.totalPages ?? 1);
        setItems((prev) => (page === 1 ? list : [...prev, ...list]));
        setTotalPages(nextTotalPages > 0 ? nextTotalPages : 1);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load reviews");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchPage();
    return () => {
      cancelled = true;
    };
  }, [page]);

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
      <h1>Review</h1>
      {error && (
        <p className="muted small" style={{ color: "#ff8c8c" }}>
          {error}
        </p>
      )}
      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
        {items.map((r) => (
          <article
            key={r.id}
            style={{
              display: "grid",
              gridTemplateColumns: "64px 1fr",
              gap: 12,
              padding: 12,
              background: "var(--panel)",
              borderRadius: 12,
            }}
          >
            <div
              style={{
                width: 64,
                height: 96,
                borderRadius: 8,
                overflow: "hidden",
                background: "#222",
              }}
            >
              {r.manhwa?.coverUrl ? (
                <img
                  src={r.manhwa.coverUrl}
                  alt={r.manhwa.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{ width: "100%", height: "100%", background: "#333" }}
                />
              )}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <h3 style={{ margin: 0 }}>{r.manhwa?.title}</h3>
                <span className="muted small">
                  by {r.user?.displayName || r.user?.username} •{" "}
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p style={{ marginTop: 8, lineHeight: 1.5 }}>{r.body}</p>
            </div>
          </article>
        ))}
      </div>
      {loading && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 80,
            marginTop: 12,
          }}
        >
          <img
            src="/loading.gif"
            alt="Loading..."
            width={40}
            height={40}
            style={{ display: "block" }}
          />
        </div>
      )}
      <div ref={sentinelRef} style={{ height: 1 }} />
    </div>
  );
}
