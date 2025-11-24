import { useState } from "react";

interface Props {
  currentProgress: number;
  readingStatus: string | null;
  onSubmit: (progress: number) => void;
}

export default function ProgressEditor({
  currentProgress,
  readingStatus,
  onSubmit,
}: Props) {
  const [val, setVal] = useState(String(currentProgress || 0));
  return (
    <div style={{ marginTop: 16 }}>
      <strong>Progress ({readingStatus || "NOT_TRACKED"}):</strong>
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        type="number"
        style={{
          margin: "6px 0",
          padding: 6,
          background: "#222",
          color: "#fff",
          border: "1px solid #444",
          borderRadius: 6,
          width: 100,
        }}
      />
      <button
        onClick={() => onSubmit(Number(val))}
        style={{
          display: "block",
          background: "#333",
          color: "#fff",
          border: "none",
          padding: "6px 12px",
          borderRadius: 6,
        }}
      >
        Update Progress
      </button>
    </div>
  );
}
