import { useEffect, useRef, useState } from "react";
import ManhwaCard from "../components/ManhwaCard";
import { getJson, getJsonEnvelope } from "../lib/api";
import { getToken } from "../lib/auth";

type Me = { id: string; username: string; displayName?: string };
type WatchItem = {
  id: string;
  slug: string;
  title: string;
  coverUrl?: string;
  status?: string;
  progress?: number;
};

type ListEnvelope = {
  success: boolean;
  data: WatchItem[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export default function Watchlist() {
  const [items, setItems] = useState<WatchItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const hasMore = page < totalPages;

  useEffect(() => {
    let cancelled = false;
    async function loadMe() {
      try {
        setError(null);
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
            ? `/user/${encodeURIComponent(username)}/status/PLANNING`
            : "",
          { page }
        );
        if (cancelled) return;
        const list = Array.isArray(res?.data) ? res.data : [];
        const nextTotalPages = Number(res?.meta?.totalPages ?? 1);
        setItems((prev) => (page === 1 ? list : [...prev, ...list]));
        setTotalPages(nextTotalPages > 0 ? nextTotalPages : 1);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load watchlist");
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
      <h1>Watchlist</h1>
      {error && (
        <p className="muted small" style={{ color: "#ff8c8c" }}>
          {error}
        </p>
      )}
      <div className="manhwa-grid" style={{ marginTop: 12 }}>
        {items.map((m) => (
          <ManhwaCard
            key={m.id}
            title={m.title}
            imageUrl={m.coverUrl || "/home1.jpeg"}
            slug={m.slug}
          />
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
