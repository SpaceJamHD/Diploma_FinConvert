import React from "react";
import "../../../styles/navbar.css";
import "../../../styles/HomePage.css";
import "../../../styles/bootstrap/css/bootstrap.min.css";
import "../../../styles/bootstrap/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Link } from "react-router-dom";
import useExchangeRates from "../../../hooks/useExchangeRates";

const Navbar = () => {
  const exchangeRates = useExchangeRates();

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

        <div className="collapse navbar-collapse mx-auto justify-content-center">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Головна
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/goals">
                Фінанси
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/history">
                Історія
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/transactions">
                Конвертація
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/analytics">
                Аналітика
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/goals">
                Цілі
              </Link>
            </li>
          </ul>
        </div>

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

        <div className="dropdown">
          <button
            className="btn btn-outline-light dropdown-toggle"
            type="button"
            id="profileMenu"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i className="bi bi-person-circle"></i>
          </button>
          <ul
            className="dropdown-menu dropdown-menu-end"
            aria-labelledby="profileMenu"
          >
            <li>
              <Link className="dropdown-item" to="/profile">
                Обліковий запис
              </Link>
            </li>
            <li>
              <a className="dropdown-item" href="#">
                Перегляд сповіщень
              </a>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <Link
                className="dropdown-item text-danger"
                to="/login"
                onClick={() => {
                  localStorage.removeItem("authToken");
                }}
              >
                Вийти
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
