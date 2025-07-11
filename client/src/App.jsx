import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import useUserRole from "./hooks/useUserRole";
import Footer from "./componets/Home/Footer/Footer";
import Navbar from "./componets/Home/Navbar/Navbar";
import HomePage from "./componets/Home/HomePage/HomePage";
import Login from "./componets/Authentication/Login/Login";
import Register from "./componets/Authentication/Register/Register";
import ProtectedRoute from "./componets/ProtectedRoute";
import ProfilePage from "./componets/Home/Profile/ProfilePage";
import GoalsPage from "./componets/Home/Goals/GoalsPage";
import GoalDetails from "./componets/Home/Goals/GoalDetails";
import TransactionsPage from "./componets/Home/Transactions/TransactionsPage";
import HistoryPage from "./componets/Home/History/HistoryPage";
import AnalyticsPage from "./componets/Home/Analytics/AnalyticsPage";
import AdminPage from "./componets/Home/Admin/AdminPage";
import AdminNavbar from "./componets/Home/Navbar/AdminNavbar";
import BannedPage from "./componets/Authentication/BannedPage";
import AdminUserDetails from "./componets/Home/Admin/AdminUserDetails";
import AdminUserHistory from "./componets/Home/Admin/AdminUserHistory";

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const role = useUserRole();

  useEffect(() => {
    if (role && location.pathname === "/") {
      if (role === "admin") {
        navigate("/admin");
      }
    }
  }, [location.pathname, role, navigate]);

  const hideFooterRoutes = ["/login", "/register", "/admin"];

  return (
    <>
      {location.pathname.startsWith("/admin") && role === "admin" ? (
        <AdminNavbar />
      ) : (
        !hideFooterRoutes.includes(location.pathname) && <Navbar />
      )}

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/goals"
          element={
            <ProtectedRoute>
              <GoalsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/goals/:goalId"
          element={
            <ProtectedRoute>
              <GoalDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <TransactionsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              {role === "admin" ? <AdminPage /> : <Navigate to="/" />}
            </ProtectedRoute>
          }
        />

        <Route path="/banned" element={<BannedPage />} />

        <Route
          path="/admin/users/:id"
          element={
            <ProtectedRoute>
              {role === "admin" ? <AdminUserDetails /> : <Navigate to="/" />}
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users/:id/history"
          element={
            <ProtectedRoute>
              {role === "admin" ? <AdminUserHistory /> : <Navigate to="/" />}
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {!hideFooterRoutes.includes(location.pathname) && role !== "admin" && (
        <Footer />
      )}
    </>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
