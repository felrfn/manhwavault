import { Link } from "react-router-dom";

type Props = {
  title: string;
  imageUrl: string;
  slug?: string;
};

export default function ManhwaCard({ title, imageUrl, slug }: Props) {
  const card = (
    <div className="manhwa-card">
      <img src={imageUrl} alt={title} loading="lazy" />
      <div className="manhwa-gradient" />
      <div className="manhwa-title" title={title}>
        {title}
      </div>
    </div>
  );
  if (slug) {
    return <Link to={`/app/manhwa/${slug}`}>{card}</Link>;
  }
  return card;
}
