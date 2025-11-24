import { useEffect, useState } from "react";
import { librarySummary } from "../lib/api/library";
import { Link } from "react-router-dom";

const statusLabels: Record<string, string> = {
  PLANNING: "Planning",
  READING: "Reading",
  COMPLETED: "Completed",
  PAUSED: "Paused",
  DROPPED: "Dropped",
};

export default function LibrarySummaryPage() {
  const [data, setData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const d = await librarySummary();
        setData(d);
      } catch {
        setError("Gagal memuat summary");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "tomato" }}>{error}</div>;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
      {Object.keys(statusLabels).map((key) => (
        <Link
          key={key}
          to={`/library/${key.toLowerCase()}`}
          style={{
            width: "180px",
            background: "#1b1b1b",
            padding: "16px",
            borderRadius: 12,
            display: "flex",
            flexDirection: "column",
            textDecoration: "none",
            color: "#fff",
          }}
        >
          <span style={{ fontWeight: 600 }}>{statusLabels[key]}</span>
          <span style={{ marginTop: 8, opacity: 0.8 }}>
            {data[key] || 0} items
          </span>
        </Link>
      ))}
    </div>
  );
}
