import { useEffect, useState } from "react";
import ManhwaCard from "../components/ManhwaCard";
import { getJson } from "../lib/api";
import { getToken } from "../lib/auth";

type Me = { id: string; username: string; displayName?: string };
type Manhwa = { id: string; slug: string; title: string; coverUrl?: string };

export default function Library() {
  const [items, setItems] = useState<Manhwa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const token = getToken();
        const me = await getJson<Me>(
          "/auth/me",
          undefined,
          token ? { Authorization: `Bearer ${token}` } : undefined
        );
        const data = await getJson<Manhwa[]>(
          `/user/${encodeURIComponent(me.username)}/favorites`
        );
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load favorites");
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
    <div className="container">
      <h1>Library</h1>
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
      {error && <p style={{ marginTop: 12, color: "tomato" }}>{error}</p>}
      {!loading && !error && items.length === 0 && (
        <p style={{ marginTop: 12, color: "var(--muted)" }}>
          Belum ada favorite. Tambahkan dari halaman Browse.
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
    </div>
  );
}
