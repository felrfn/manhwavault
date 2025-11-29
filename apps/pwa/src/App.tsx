import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { AuthGuard } from "./components/AuthGuard";
import Navbar from "./components/Navbar";
import Library from "./pages/Library";
import Browse from "./pages/Browse";
import Watchlist from "./pages/Watchlist";
import Review from "./pages/Review";
import Profile from "./pages/Profile";
import ProfileActivity from "./pages/ProfileActivity";
import ManhwaDetail from "./pages/ManhwaDetail";
import ProfileDiary from "./pages/ProfileDiary";
import ProfilePaused from "./pages/ProfilePaused";

function ProtectedApp() {
  return (
    <div className="app-shell">
      <Navbar />
      <div className="app-content">
        <Routes>
          <Route path="library" element={<Library />} />
          <Route path="browse" element={<Browse />} />
          <Route path="watchlist" element={<Watchlist />} />
          <Route path="review" element={<Review />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/activity" element={<ProfileActivity />} />
          <Route path="profile/diary" element={<ProfileDiary />} />
          <Route path="profile/paused" element={<ProfilePaused />} />
          <Route path="manhwa/:slug" element={<ManhwaDetail />} />
          <Route index element={<Navigate to="library" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/app/*"
        element={
          <AuthGuard>
            <ProtectedApp />
          </AuthGuard>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
