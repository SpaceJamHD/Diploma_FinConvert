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
        navigate("/login");
        return;
      }

      if (!bannedUntil) {
        navigate("/login");
        return;
      }

      if (diff <= 0) {
        setRemainingTime(" Ви розблоковані");
        setTimeout(() => navigate("/login"), 3000);
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
        backgroundColor: "#0d0d0d",
        color: "#eaeaea",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "2rem",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          background: "#1a1a1a",
          border: "1px solid #333",
          borderRadius: "12px",
          padding: "3rem 2.5rem",
          maxWidth: "460px",
          width: "100%",
          boxShadow: "0 0 20px rgba(0,0,0,0.6)",
        }}
      >
        <h1
          style={{
            fontSize: "2.5rem",
            marginBottom: "1rem",
            color: "#ff4d4f",
          }}
        >
          Вас заблоковано
        </h1>

        <p
          style={{
            fontSize: "1.1rem",
            marginBottom: "1rem",
            color: "#cccccc",
          }}
        >
          До завершення блокування:{" "}
          <strong style={{ color: "#ffffff" }}>{remainingTime}</strong>
        </p>

        {reason && (
          <p
            style={{
              fontSize: "0.95rem",
              fontStyle: "italic",
              color: "#f0ad4e",
              marginBottom: "2rem",
            }}
          >
            Причина: {reason}
          </p>
        )}

        <a
          href="mailto:support@finconvert.com"
          style={{
            padding: "0.7rem 1.4rem",
            backgroundColor: "#444",
            color: "#fff",
            borderRadius: "6px",
            textDecoration: "none",
            fontWeight: "500",
            transition: "background 0.3s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#666")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#444")}
        >
          Зв’язатися з підтримкою
        </a>
      </div>
    </div>
  );
};

export default BannedPage;
