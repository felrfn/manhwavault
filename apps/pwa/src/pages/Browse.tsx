import { useEffect, useRef, useState } from "react";
import { getJsonEnvelope } from "../lib/api";
import ManhwaCard from "../components/ManhwaCard";

type Manhwa = {
  id: string;
  slug: string;
  title: string;
  coverUrl: string;
  genres?: string[];
};

type ListEnvelope = {
  success: boolean;
  data: Manhwa[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export default function Browse() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Manhwa[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const hasMore = page < totalPages;

  // Debounced search term
  const debouncedQuery = useDebounce(query, 350);

  useEffect(() => {
    // reset when query changes
    setItems([]);
    setPage(1);
    setTotalPages(1);
  }, [debouncedQuery]);

  useEffect(() => {
    let cancelled = false;
    async function fetchPage() {
      setLoading(true);
      setError(null);
      try {
        const res = await getJsonEnvelope<ListEnvelope>("manhwa", {
          page,
          search: debouncedQuery || undefined,
        });
        if (cancelled) return;
        const list = Array.isArray(res?.data) ? res.data : [];
        const nextTotalPages = Number(res?.meta?.totalPages ?? 1);
        setItems((prev) => (page === 1 ? list : [...prev, ...list]));
        setTotalPages(nextTotalPages > 0 ? nextTotalPages : 1);
      } catch (e: any) {
        if (!cancelled) setError(e.message || "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchPage();
    return () => {
      cancelled = true;
    };
  }, [page, debouncedQuery]);

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
    <div className="browse">
      <div className="searchbar">
        <div className="container">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
            placeholder="Search manhwa titles, genres..."
            aria-label="Search manhwa"
          />
        </div>
      </div>
      <div className="container" style={{ paddingTop: 12 }}>
        {error && (
          <p className="muted small" style={{ color: "#ff8c8c" }}>
            {error}
          </p>
        )}
        <div className="manhwa-grid">
          {items.map((m) => (
            <ManhwaCard
              key={m.id}
              title={m.title}
              imageUrl={m.coverUrl}
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
    </div>
  );
}

function useDebounce<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}
