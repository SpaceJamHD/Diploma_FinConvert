import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
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

const AppContent = () => {
  const location = useLocation();

  const hideFooterRoutes = ["/login", "/register"];

  return (
    <>
      {!hideFooterRoutes.includes(location.pathname) && <Navbar />}
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

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {!hideFooterRoutes.includes(location.pathname) && <Footer />}
    </>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
