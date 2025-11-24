
const colorMap: Record<string, string> = {
  PLANNING: "#3b82f6",
  READING: "#22c55e",
  COMPLETED: "#8b5cf6",
  PAUSED: "#f97316",
  DROPPED: "#ef4444",
};

interface Props {
  status?: string | null;
  progress?: number | null;
}

export default function StatusBadge({ status, progress }: Props) {
  if (!status) {
    return (
      <span
        style={{
          background: "#555",
          padding: "4px 10px",
          borderRadius: 12,
          fontSize: 12,
        }}
      >
        Not Tracked
      </span>
    );
  }
  return (
    <span
      style={{
        background: colorMap[status] || "#666",
        padding: "4px 10px",
        borderRadius: 12,
        fontSize: 12,
        display: "inline-flex",
        gap: 8,
        alignItems: "center",
      }}
    >
      {status}
      {typeof progress === "number" && (
        <span style={{ opacity: 0.8 }}>Ch. {progress}</span>
      )}
    </span>
  );
}
