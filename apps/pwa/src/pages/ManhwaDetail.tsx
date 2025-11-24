import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { manhwaDetail, toggleFavorite, updateStatus } from "../lib/api/manhwa";
import StatusBadge from "../components/StatusBadge";
import ProgressEditor from "../components/ProgressEditor";

export default function ManhwaDetailPage() {
  const { slug } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [favLoading, setFavLoading] = useState(false);
  const [, setStatusLoading] = useState(false);

  async function load() {
    if (!slug) return;
    setLoading(true);
    setError("");
    try {
      const d = await manhwaDetail(slug);
      setData(d);
    } catch {
      setError("Gagal memuat detail");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [slug]);

  async function toggleFav() {
    if (!slug) return;
    setFavLoading(true);
    try {
      await toggleFavorite(slug);
      await load();
    } finally {
      setFavLoading(false);
    }
  }

  async function updateProgress(p: number) {
    if (!slug || !data) return;
    setStatusLoading(true);
    try {
      await updateStatus(slug, data.readingStatus || "PLANNING", p);
      await load();
    } finally {
      setStatusLoading(false);
    }
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "tomato" }}>{error}</div>;
  if (!data) return null;

  return (
    <div>
      <h2>{data.title}</h2>
      <StatusBadge status={data.readingStatus} progress={data.progress} />
      <div style={{ marginTop: 12, fontSize: 14, opacity: 0.8 }}>
        Genres: {data.genres?.join(", ")}
      </div>
      <button
        onClick={toggleFav}
        disabled={favLoading}
        style={{
          marginTop: 12,
          background: data.isFavorite ? "#eab308" : "#444",
          color: "#fff",
          border: "none",
          padding: "8px 16px",
          borderRadius: 8,
        }}
      >
        {favLoading ? "..." : data.isFavorite ? "★ Favorite" : "☆ Favorite"}
      </button>
      <p style={{ marginTop: 16 }}>{data.description || "No description."}</p>
      <ProgressEditor
        currentProgress={data.progress || 0}
        readingStatus={data.readingStatus || null}
        onSubmit={updateProgress}
      />
      <div style={{ marginTop: 20 }}>
        <Link to={`/manhwa/${data.slug}/comments`} style={{ color: "#8dd" }}>
          Lihat Komentar →
        </Link>
      </div>
    </div>
  );
}
