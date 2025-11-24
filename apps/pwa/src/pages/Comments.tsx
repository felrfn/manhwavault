import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchComments, postComment } from "../lib/api/manhwa";
import CommentItem from "../components/CommentItem";

export default function CommentsPage() {
  const { slug } = useParams();
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [posting, setPosting] = useState(false);

  async function load() {
    if (!slug) return;
    setLoading(true);
    setError("");
    try {
      const list = await fetchComments(slug);
      setComments(list);
    } catch {
      setError("Gagal memuat komentar");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [slug]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!slug || !body.trim()) return;
    setPosting(true);
    try {
      await postComment(slug, body.trim());
      setBody("");
      await load();
    } catch {
      setError("Gagal kirim komentar");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div>
      <h2>Komentar</h2>
      <form onSubmit={submit} style={{ marginBottom: 12 }}>
        <textarea
          placeholder="Tambah komentar..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          style={{
            width: "100%",
            maxWidth: 600,
            minHeight: 80,
            padding: 10,
            background: "#222",
            color: "#fff",
            border: "1px solid #333",
            borderRadius: 8,
          }}
        />
        <button
          type="submit"
          disabled={posting || !body.trim()}
          style={{
            marginTop: 8,
            background: "#444",
            color: "#fff",
            border: "none",
            padding: "8px 16px",
            borderRadius: 8,
          }}
        >
          {posting ? "Mengirim..." : "Kirim"}
        </button>
      </form>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "tomato" }}>{error}</div>}
      {comments.map((c) => (
        <CommentItem key={c.id} comment={c} />
      ))}
      {!loading && comments.length === 0 && <div>Tidak ada komentar.</div>}
    </div>
  );
}
