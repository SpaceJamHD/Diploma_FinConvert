import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const BannedPage = () => {
  const [remainingTime, setRemainingTime] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { bannedUntil, reason } = location.state || {};

  useEffect(() => {
    const updateRemainingTime = () => {
      const now = new Date();
      const end = new Date(bannedUntil);
      const diff = end - now;

      if (diff <= 0) {
        navigate("/login"); // если бан истёк — вернуться на вход
        return;
      }

      if (!bannedUntil) {
        navigate("/login");
        return;
      }

      if (diff <= 0) {
        setRemainingTime(" Ви розблоковані");
        setTimeout(() => navigate("/login"), 3000); // подождать 3 сек
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setRemainingTime(`${hours}г ${minutes}хв ${seconds}с`);
    };

    const interval = setInterval(updateRemainingTime, 1000);
    return () => clearInterval(interval);
  }, [bannedUntil, navigate]);

  return (
    <div
      style={{
        backgroundColor: "#111",
        color: "#fff",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <h1 style={{ fontSize: "3rem", color: "#dc3545" }}>🔒 Вас заблоковано</h1>
      <p style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
        ⏳ Залишилось: <strong>{remainingTime}</strong>
      </p>
      {reason && (
        <p style={{ fontStyle: "italic", color: "#ffc107" }}>
          📄 Причина: {reason}
        </p>
      )}
      <a
        href="mailto:support@finconvert.com"
        style={{
          marginTop: "2rem",
          padding: "0.8rem 1.6rem",
          backgroundColor: "#007bff",
          color: "#fff",
          borderRadius: "8px",
          textDecoration: "none",
        }}
      >
        📬 Написати в підтримку
      </a>
    </div>
  );
};

export default BannedPage;
