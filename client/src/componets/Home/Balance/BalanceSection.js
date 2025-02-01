import React, { useEffect, useState } from "react";

const BalanceSection = ({ hideViewAll = false }) => {
  const [balances, setBalances] = useState({
    UAH: 0,
    USD: 0,
    BTC: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  const fetchBalances = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("❌ Ошибка: Токен отсутствует");
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
      console.log("🎯 Баланс получен с сервера:", data); // ✅ Логируем для проверки

      setBalances(data);
    } catch (error) {
      console.error("❌ Ошибка загрузки баланса:", error);
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
    <section id="account-balance" className="mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-light mb-0">Баланс ваших рахунків</h2>
        {!hideViewAll && (
          <button
            className="btn btn-link text-warning text-decoration-none d-flex align-items-center"
            onClick={() => console.log("Navigate to full view")}
          >
            Переглянути всі{" "}
            <i className="bi bi-arrow-right-circle ms-2 fs-4"></i>
          </button>
        )}
      </div>

      {isLoading ? (
        <p className="text-light">⏳ Завантаження...</p>
      ) : (
        <div className="row gy-5 shadow-lg">
          {[
            {
              label: "Гривня (UAH)",
              value: balances.UAH,
              icon: "bi bi-currency-exchange",
              color: "text-warning",
            },
            {
              label: "Долар США (USD)",
              value: balances.USD,
              icon: "bi bi-cash-coin",
              color: "text-primary",
            },
            {
              label: "Біткойн (BTC)",
              value: balances.BTC,
              icon: "bi bi-coin",
              color: "text-success",
            },
          ].map((item, index) => (
            <div key={index} className="col-md-4">
              <div className="card balance-card bg-dark text-light shadow">
                <div className="card-body text-center py-4">
                  <div className={`balance-icon mb-3 ${item.color}`}>
                    <i className={`${item.icon} fs-2`}></i>
                  </div>
                  <h5 className="card-title mb-2">{item.label}</h5>
                  <p className="balance-value fs-4">
                    {item.label.includes("BTC")
                      ? `${Number(balances.BTC).toFixed(6)} BTC`
                      : formatCurrency(
                          item.value,
                          item.label.includes("USD") ? "USD" : "UAH"
                        )}
                  </p>
                  <small className="text-muted">Оновлено: сьогодні</small>
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
