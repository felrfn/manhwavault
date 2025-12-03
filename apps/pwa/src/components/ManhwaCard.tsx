import { Link } from "react-router-dom";

type Props = {
  title: string;
  imageUrl: string;
  slug?: string;
  avgRating?: number;
};

export default function ManhwaCard({
  title,
  imageUrl,
  slug,
  avgRating,
}: Props) {
  const card = (
    <div className="manhwa-card">
      <img src={imageUrl} alt={title} loading="lazy" />
      <div className="manhwa-gradient" />
      <div className="manhwa-title" title={title}>
        {title}
      </div>
      {typeof avgRating === "number" && (
        <div
          className="manhwa-rating-stars"
          title={`Rating ${avgRating.toFixed(1)}/5`}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} className={n <= avgRating ? "on" : "off"}>
              ★
            </span>
          ))}
        </div>
      )}
    </div>
  );
  if (slug) {
    return <Link to={`/app/manhwa/${slug}`}>{card}</Link>;
  }
  return card;
}
