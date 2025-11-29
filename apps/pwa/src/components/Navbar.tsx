import { Link, useLocation } from "react-router-dom";

type Item = {
  to: string;
  label: string;
  icon: string;
};

const items: Item[] = [
  { to: "/app/library", label: "Library", icon: "/nav/library.png" },
  { to: "/app/browse", label: "Browse", icon: "/nav/browse.png" },
  { to: "/app/watchlist", label: "Watchlist", icon: "/nav/watchlist.png" },
  { to: "/app/review", label: "Review", icon: "/nav/review.png" },
  { to: "/app/profile", label: "Profile", icon: "/nav/profile.png" },
];

export default function Navbar() {
  const { pathname } = useLocation();
  return (
    <>
      <nav className="nav-desktop">
        <div className="nav-container">
          <div className="brand">ManhwaVault</div>
          <ul className="nav-list">
            {items.map((it) => (
              <li
                key={it.to}
                className={pathname.startsWith(it.to) ? "active" : ""}
              >
                <Link to={it.to} className="nav-link">
                  <img src={it.icon} alt="" aria-hidden />
                  <span>{it.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <nav className="nav-mobile" role="tablist" aria-label="Bottom navigation">
        {items.map((it) => (
          <Link
            key={it.to}
            to={it.to}
            role="tab"
            aria-selected={pathname.startsWith(it.to)}
            className={`tab ${pathname.startsWith(it.to) ? "active" : ""}`}
          >
            <img src={it.icon} alt="" aria-hidden />
            <span>{it.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
