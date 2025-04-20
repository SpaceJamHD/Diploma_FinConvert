import React, { useState, useEffect } from "react";
import "../../../styles/navbar.css";
import "../../../styles/HomePage.css";
import "../../../styles/bootstrap/css/bootstrap.min.css";
import "../../../styles/bootstrap/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Link, useNavigate } from "react-router-dom";
import useExchangeRates from "../../../hooks/useExchangeRates.jsx";
import axiosInstance from "../../../utils/axiosInstance";

const AdminNavbar = () => {
  const exchangeRates = useExchangeRates();
  const [hasUnread, setHasUnread] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUnreadStatus = async () => {
      try {
        const { data: notis } = await axiosInstance.get("/api/notifications");
        const unread = notis.some((n) => !n.read);
        setHasUnread(unread);
      } catch (err) {
        console.error("Не вдалося отримати статус сповіщень:", err);
      }
    };

    fetchUnreadStatus();
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark px-3">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/admin">
          <img
            src="/img/coin_icon_transparent-removebg-preview.png"
            alt="Логотип"
            className="d-inline-block align-text-top"
          />
          <span>FinConvert Admin</span>
        </Link>

        <div className="d-flex align-items-center">
          <div className="dropdown me-3">
            <button
              className="btn btn-dark dropdown-toggle"
              type="button"
              id="currencyMenu"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Курси валют
            </button>
            <ul className="dropdown-menu dropdown-menu-end bg-dark text-white">
              <li className="dropdown-item text-white fw-bold">
                Фіатні валюти:
              </li>
              <li className="dropdown-item text-white">
                USD → UAH: <strong>{exchangeRates.usdToUah}</strong>
              </li>
              <li className="dropdown-item text-white">
                EUR → UAH: <strong>{exchangeRates.eurToUah}</strong>
              </li>
              <li className="dropdown-item text-white">
                NOK → UAH: <strong>{exchangeRates.nokToUah}</strong>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li className="dropdown-item text-white fw-bold">
                Криптовалюти:
              </li>
              <li className="dropdown-item text-white">
                BTC → UAH: <strong>{exchangeRates.btcToUah}</strong>
              </li>
              <li className="dropdown-item text-white">
                ETH → UAH: <strong>{exchangeRates.ethToUah}</strong>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li className="dropdown-item text-white">
                <small>{exchangeRates.updateTime}</small>
              </li>
            </ul>
          </div>

          <div className="dropdown" style={{ position: "relative" }}>
            <button
              className="btn btn-outline-light dropdown-toggle"
              type="button"
              id="profileMenu"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="bi bi-person-circle"></i>
              {hasUnread && (
                <span
                  style={{
                    position: "absolute",
                    top: "4px",
                    right: "4px",
                    background: "red",
                    borderRadius: "50%",
                    width: "10px",
                    height: "10px",
                  }}
                ></span>
              )}
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <span className="dropdown-item text-muted">Адміністратор</span>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <Link
                  className="dropdown-item text-danger"
                  to="/login"
                  onClick={() => {
                    localStorage.removeItem("token");
                    navigate("/login");
                  }}
                >
                  Вийти
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
