import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsAuthorized(false);
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          localStorage.removeItem("token");
          setIsAuthorized(false);
          return;
        }

        const response = await fetch(
          `http://localhost:5000/api/users/validate/${decoded.id}`
        );
        const data = await response.json();

        if (data.valid) {
          setIsAuthorized(true);
        } else {
          localStorage.removeItem("token");
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error("Ошибка при проверке токена:", error);
        localStorage.removeItem("token");
        setIsAuthorized(false);
      }
    };

    validateToken();
  }, [token]);

  if (isAuthorized === null) {
    return <div>Завантаження...</div>;
  }

  if (!isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
