import React, { useState, useEffect } from "react";
import NotificationDropdown from "./NotificationDropdown.jsx";
import "../../../styles/navbar.css";
import "../../../styles/HomePage.css";
import "../../../styles/bootstrap/css/bootstrap.min.css";
import "../../../styles/bootstrap/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Link } from "react-router-dom";
import useExchangeRates from "../../../hooks/useExchangeRates.jsx";
import useUserRole from "../../../hooks/useUserRole";
import axiosInstance from "../../../utils/axiosInstance";

const Navbar = () => {
  const exchangeRates = useExchangeRates();
  const [hasUnread, setHasUnread] = useState(false);
  const role = useUserRole();
  const isBannedPage = window.location.pathname === "/banned";

  useEffect(() => {
    const fetchUnreadStatus = async () => {
      try {
        const res = await axiosInstance.get("/api/notifications");
        const notis = res.data;
        const unread = notis.some((n) => !n.read);
        setHasUnread(unread);
      } catch (err) {
        console.error(" Статус непрочитаних не вдалося отримати:", err);
      }
    };

    fetchUnreadStatus();
  }, []);

  useEffect(() => {
    const checkNotifications = () => {
      const notis = JSON.parse(localStorage.getItem("notifications")) || [];
      const unread = notis.some((n) => n.read === false);
      setHasUnread(unread);
    };

    checkNotifications();
    window.addEventListener("storage", checkNotifications);
    return () => window.removeEventListener("storage", checkNotifications);
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark px-3">
      <div className="container-fluid">
        <a className="navbar-brand" href="/">
          <img
            src="/img/coin_icon_transparent-removebg-preview.png"
            alt="Логотип"
            className="d-inline-block align-text-top"
          />
          <span>FinConvert</span>
        </a>

        {role !== "admin" && !isBannedPage && (
          <>
            <div
              className="collapse navbar-collapse mx-auto justify-content-center"
              id="navbarNav"
            >
              <ul className="navbar-nav">
                <li className="nav-item">
                  <Link
                    className="nav-link"
                    to="/"
                    onClick={() => {
                      const nav = document.getElementById("navbarNav");
                      if (nav?.classList.contains("show")) {
                        nav.classList.remove("show");
                      }
                    }}
                  >
                    Головна
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="nav-link"
                    to="/history"
                    onClick={() => {
                      const nav = document.getElementById("navbarNav");
                      if (nav?.classList.contains("show")) {
                        nav.classList.remove("show");
                      }
                    }}
                  >
                    Історія
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="nav-link"
                    to="/transactions"
                    onClick={() => {
                      const nav = document.getElementById("navbarNav");
                      if (nav?.classList.contains("show")) {
                        nav.classList.remove("show");
                      }
                    }}
                  >
                    Конвертація
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="nav-link"
                    to="/analytics"
                    onClick={() => {
                      const nav = document.getElementById("navbarNav");
                      if (nav?.classList.contains("show")) {
                        nav.classList.remove("show");
                      }
                    }}
                  >
                    Аналітика
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="nav-link"
                    to="/goals"
                    onClick={() => {
                      const nav = document.getElementById("navbarNav");
                      if (nav?.classList.contains("show")) {
                        nav.classList.remove("show");
                      }
                    }}
                  >
                    Цілі
                  </Link>
                </li>
              </ul>
            </div>
          </>
        )}

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
          <ul
            className="dropdown-menu dropdown-menu-end"
            aria-labelledby="profileMenu"
          >
            {!isBannedPage && (
              <>
                <li>
                  <Link className="dropdown-item" to="/profile">
                    Обліковий запис
                  </Link>
                </li>
                <li>
                  <NotificationDropdown onOpen={() => setHasUnread(false)} />
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
              </>
            )}
            <li>
              <Link
                className="dropdown-item text-danger"
                to="/login"
                onClick={() => {
                  localStorage.removeItem("token");
                }}
              >
                Вийти
              </Link>
            </li>
          </ul>
        </div>
        <button
          className="navbar-toggler"
          type="button"
          onClick={() =>
            document.getElementById("navbarNav").classList.toggle("show")
          }
        >
          <span className="navbar-toggler-icon"></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
