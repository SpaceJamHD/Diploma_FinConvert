import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const decoded = jwtDecode(token);

    const isValidUser = async () => {
      const response = await fetch(
        `http://localhost:5000/api/users/validate/${decoded.id}`
      );
      const data = await response.json();
      return data.valid;
    };

    if (!decoded || !decoded.role || !isValidUser()) {
      return <Navigate to="/login" />;
    }

    return children;
  } catch (error) {
    console.error("Ошибка проверки токена:", error);
    return <Navigate to="/login" />;
  }
};

export default ProtectedRoute;
