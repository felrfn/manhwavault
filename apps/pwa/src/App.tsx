import { useEffect, useRef } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import ManhwaListPage from "./pages/ManhwaList";
import ManhwaDetailPage from "./pages/ManhwaDetail";
import CommentsPage from "./pages/Comments";
import LibrarySummaryPage from "./pages/LibrarySummary";
import LibraryStatusPage from "./pages/LibraryStatus";

function NavBar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <nav style={styles.nav}>
      <Link to="/">Explore</Link>
      <Link to="/library">Library</Link>
      {user ? (
        <>
          <span style={styles.greeting}>
            Hi, {(user.displayName || user.username || "").trim()}
          </span>
          <button
            type="button"
            onClick={logout}
            style={styles.logoutButton}
            aria-label="Logout"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          {location.pathname !== "/login" && <Link to="/login">Login</Link>}
          {location.pathname !== "/register" && (
            <Link to="/register">Register</Link>
          )}
        </>
      )}
    </nav>
  );
}

/**
 * AppShell: wrapper utama yang memulihkan session lalu menampilkan router.
 */
function AppShell() {
  const { loading, restore } = useAuth();
  const restoredRef = useRef(false);

  useEffect(() => {
    if (!restoredRef.current) {
      restoredRef.current = true;
      restore();
    }
  }, [restore]);

  if (loading) {
    return <div style={styles.loading}>Loading session…</div>;
  }

  return (
    <>
      <NavBar />
      <main style={styles.main}>
        <Routes>
          <Route path="/" element={<ManhwaListPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/library" element={<LibrarySummaryPage />} />
          <Route path="/library/:status" element={<LibraryStatusPage />} />
          <Route path="/manhwa/:slug" element={<ManhwaDetailPage />} />
          <Route path="/manhwa/:slug/comments" element={<CommentsPage />} />
          {/* Tambahkan route NotFound di kemudian hari */}
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: "flex",
    gap: 16,
    padding: 12,
    background: "#111",
    alignItems: "center",
    flexWrap: "wrap",
  },
  greeting: {
    opacity: 0.7,
  },
  logoutButton: {
    background: "#333",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    cursor: "pointer",
    borderRadius: 6,
  },
  loading: {
    padding: 24,
  },
  main: {
    padding: 16,
  },
};
