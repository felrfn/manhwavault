import React, { useEffect, useState } from "react";
import { listManhwa } from "../lib/api/manhwa";
import ManhwaCard from "../components/ManhwaCard";
import type { Manhwa } from "../lib/api/types";

export default function ManhwaListPage() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Manhwa[]>([]);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await listManhwa(1, 30, search || undefined);
      setItems(res.data);
    } catch (e) {
      setError("Gagal memuat daftar");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    load();
  }

  return (
    <div>
      <form onSubmit={handleSearch} style={{ marginBottom: 12 }}>
        <input
          placeholder="Cari manhwa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: 10,
            width: "100%",
            maxWidth: 420,
            border: "1px solid #333",
            background: "#222",
            color: "#fff",
            borderRadius: 8,
          }}
        />
      </form>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "tomato" }}>{error}</div>}
      {items.map((m) => (
        <ManhwaCard key={m.slug} manhwa={m} />
      ))}
      {!loading && items.length === 0 && <div>Tidak ada hasil.</div>}
    </div>
  );
}
