import type { Comment } from "../lib/api/types";

export default function CommentItem({ comment }: { comment: Comment }) {
  const userDisplay = comment.user.displayName || comment.user.username;
  return (
    <div style={{ padding: "10px 0", borderBottom: "1px solid #222" }}>
      <div style={{ fontWeight: 600 }}>{userDisplay}</div>
      <div style={{ marginTop: 4 }}>{comment.body}</div>
      <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>
        {new Date(comment.createdAt).toLocaleString()}
      </div>
    </div>
  );
}
