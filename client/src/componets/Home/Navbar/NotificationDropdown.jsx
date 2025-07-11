import React, { useState, useEffect } from "react";
import axiosInstance from "../../../utils/axiosInstance";

const NotificationDropdown = ({ onOpen }) => {
  const [notifications, setNotifications] = useState([]);
  const [visible, setVisible] = useState(false);

  const fetchNotifications = async () => {
    try {
      const { data } = await axiosInstance.get("/api/notifications");

      if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        console.warn("Очікувався масив, але прийшло:", data);
        setNotifications([]);
      }
    } catch (err) {
      console.error("Не вдалося отримати сповіщення:", err);
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatMessage = (message) => {
    const regex = /на ([\d.]+) (\w{3})$/;
    const match = message.match(regex);

    if (!match) return message;

    const [_, amount, currency] = match;
    const formattedAmount =
      currency === "BTC"
        ? parseFloat(amount).toFixed(8)
        : parseFloat(amount).toFixed(2);

    return message.replace(regex, `на ${formattedAmount} ${currency}`);
  };

  useEffect(() => {
    if (visible) {
      const markAsRead = async () => {
        try {
          await axiosInstance.post("/api/notifications/mark-all-read");

          const updated = notifications.map((n) => ({ ...n, read: true }));
          setNotifications(updated);
          onOpen?.();
        } catch (err) {
          console.error("Не вдалося оновити статус прочитаного", err);
        }
      };

      markAsRead();
    }
  }, [visible]);

  const toggleDropdown = () => {
    setVisible(!visible);
  };

  return (
    <div style={{ position: "relative" }}>
      <a
        className="dropdown-item"
        href="#"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleDropdown();
        }}
      >
        Перегляд сповіщень
      </a>

      {visible && (
        <div
          className="notification-dropdown"
          style={{
            position: "absolute",
            top: "100%",
            right: "0",
            backgroundColor: "#1e1e1e",
            color: "#fff",
            width: "320px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
            borderRadius: "8px",
            padding: "15px",
            zIndex: 2000,
          }}
        >
          <h6 style={{ color: "#ffd700", marginBottom: "10px" }}>
            Останні сповіщення:
          </h6>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {notifications.length === 0 ? (
              <li style={{ color: "#ccc" }}>Сповіщень немає</li>
            ) : (
              notifications.map((note, index) => (
                <li
                  key={index}
                  style={{
                    marginBottom: "12px",
                    padding: "10px",
                    backgroundColor: note.read ? "#2c2c2c" : "#1e1e1e",
                    borderRadius: "8px",
                    boxShadow: note.read
                      ? "none"
                      : "0 0 10px rgba(255, 215, 0, 0.4)",
                  }}
                >
                  <div style={{ fontSize: "0.92rem", color: "#fff" }}>
                    {formatMessage(note.message)}
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#bbb",
                      marginTop: "3px",
                    }}
                  >
                    {new Date(note.created_at).toLocaleString("uk-UA")}
                  </div>
                  {!note.read && (
                    <div
                      style={{
                        marginTop: "6px",
                        fontSize: "0.75rem",
                        color: "#ffd700",
                      }}
                    >
                      Нове сповіщення
                    </div>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
