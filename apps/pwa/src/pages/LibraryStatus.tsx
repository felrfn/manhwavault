import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { listLibrary } from "../lib/api/library";
import ManhwaCard from "../components/ManhwaCard";

export default function LibraryStatusPage() {
  const { status } = useParams();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!status) return;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await listLibrary(status);
        setItems(res.data);
      } catch {
        setError("Gagal memuat");
      } finally {
        setLoading(false);
      }
    })();
  }, [status]);

  return (
    <div>
      <h2>Status: {status}</h2>
      <Link to="/library" style={{ color: "#8dd" }}>
        ← Kembali ke summary
      </Link>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "tomato" }}>{error}</div>}
      {items.map((it) => (
        <ManhwaCard
          key={it.slug}
          manhwa={{
            id: "",
            slug: it.slug,
            title: it.title,
            coverUrl: it.coverUrl,
            genres: it.genres,
            createdAt: it.updatedAt,
          }}
          badgeOverride={it.status}
        />
      ))}
      {!loading && items.length === 0 && <div>Tidak ada item.</div>}
    </div>
  );
}
