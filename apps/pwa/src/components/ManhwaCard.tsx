import type { Manhwa } from "../lib/api/types";
import { Link } from "react-router-dom";

interface Props {
  manhwa: Manhwa;
  badgeOverride?: string;
}

export default function ManhwaCard({ manhwa, badgeOverride }: Props) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: "10px 0",
        borderBottom: "1px solid #222",
      }}
    >
      {manhwa.coverUrl ? (
        <img
          src={manhwa.coverUrl}
          alt={manhwa.title}
          style={{
            width: 70,
            height: 100,
            objectFit: "cover",
            borderRadius: 8,
          }}
        />
      ) : (
        <div
          style={{
            width: 70,
            height: 100,
            background: "#333",
            borderRadius: 8,
          }}
        />
      )}
      <div style={{ flex: 1 }}>
        <Link
          to={`/manhwa/${manhwa.slug}`}
          style={{ color: "#fff", fontWeight: 600 }}
        >
          {manhwa.title}
        </Link>
        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
          {manhwa.genres?.join(", ")}
        </div>
        {badgeOverride && (
          <div style={{ fontSize: 11, marginTop: 6, color: "#4ade80" }}>
            {badgeOverride}
          </div>
        )}
      </div>
    </div>
  );
}
