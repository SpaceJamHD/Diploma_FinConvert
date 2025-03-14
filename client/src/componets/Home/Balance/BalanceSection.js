import React, { useEffect, useState } from "react";
import useWebSocket from "../../../hooks/useWebSocket";

const BalanceSection = ({ hideViewAll = false }) => {
  const [balances, setBalances] = useState({
    UAH: 0,
    USD: 0,
    EUR: 0,
    BTC: 0,
  });

  useWebSocket((updatedBalances) => {
    console.log(" Обновленный баланс:", updatedBalances);
    setBalances(updatedBalances);
    fetchBalances();
  });

  const [isLoading, setIsLoading] = useState(true);

  const fetchBalances = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error(" Ошибка: Токен отсутствует");
        return;
      }

      const response = await fetch("http://localhost:5000/api/balances", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Ошибка API: ${response.status}`);
      }

      const data = await response.json();

      const btcBalance = data.BTC
        ? parseFloat(data.BTC).toFixed(8)
        : "0.00000000";

      setBalances({
        UAH: data.UAH || 0,
        USD: data.USD || 0,
        EUR: data.EUR || 0,
        BTC: btcBalance,
      });

      console.log(" Баланс получен с сервера:", data);
    } catch (error) {
      console.error(" Ошибка загрузки баланса:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, []);

  const formatCurrency = (value, currency) => {
    return new Intl.NumberFormat("uk-UA", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <section id="account-balance" className="mb-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h2 className="text-light mb-0 fw-bold">Баланс ваших рахунків</h2>
        {!hideViewAll && (
          <button
            className="btn btn-link text-warning text-decoration-none d-flex align-items-center"
            onClick={() => console.log("Navigate to full view")}
          >
            Переглянути всі{" "}
            <i className="bi bi-arrow-right-circle ms-2 fs-5"></i>
          </button>
        )}
      </div>

      {isLoading ? (
        <p className="text-light"> Завантаження...</p>
      ) : (
        <div className="row gy-3 gx-2">
          {[
            {
              label: "Гривня (UAH)",
              value: balances.UAH,
              icon: "bi bi-currency-exchange",
              color: "text-warning",
              currency: "UAH",
            },
            {
              label: "Долар США (USD)",
              value: balances.USD,
              icon: "bi bi-cash-coin",
              color: "text-primary",
              currency: "USD",
            },
            {
              label: "Євро (EUR)",
              value: balances.EUR,
              icon: "bi bi-currency-euro",
              color: "text-info",
              currency: "EUR",
            },
            {
              label: "Біткойн (BTC)",
              value: balances.BTC,
              icon: "bi bi-coin",
              color: "text-success",
              currency: "BTC",
            },
          ].map((item, index) => (
            <div key={index} className="col-6 col-md-3">
              <div className="card balance-card bg-dark text-light shadow-sm">
                <div className="card-body text-center py-2">
                  <div className={`balance-icon mb-2 ${item.color}`}>
                    <i className={`${item.icon} fs-3`}></i>
                  </div>
                  <h6 className="card-title mb-1 fw-bold">{item.label}</h6>
                  <p className="balance-value fs-3 fw-bold">
                    {item.currency === "BTC"
                      ? `${Number(balances.BTC).toFixed(8)} BTC`
                      : formatCurrency(item.value, item.currency)}
                  </p>

                  <small className="text-muted">
                    Оновлено:{" "}
                    {new Date().toLocaleTimeString("uk-UA", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default BalanceSection;
