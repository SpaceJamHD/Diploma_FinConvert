import React, { useEffect, useState } from "react";

const BalanceSection = ({ hideViewAll = false }) => {
  const [balances, setBalances] = useState({ UAH: 0, USD: 0, BTC: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const fetchBalances = async () => {
    try {
      const response = await fetch("/api/balances");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setBalances(data || { UAH: 0, USD: 0, BTC: 0 });
    } catch (error) {
      console.error("Ошибка загрузки баланса:", error);
      setBalances({ UAH: 0, USD: 0, BTC: 0 });
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
        <p className="text-light">Завантаження...</p>
      ) : (
        <div className="row gy-5 shadow-lg">
          <div className="col-md-4">
            <div className="card balance-card bg-dark text-light shadow">
              <div className="card-body text-center py-4">
                <div className="balance-icon mb-3">
                  <i className="bi bi-currency-exchange text-warning fs-2"></i>
                </div>
                <h5 className="card-title mb-2">Гривня (UAH)</h5>
                <p className="balance-value fs-4">
                  {formatCurrency(balances.UAH, "UAH")}
                </p>
                <small className="text-muted">Оновлено: сьогодні</small>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card balance-card bg-dark text-light shadow">
              <div className="card-body text-center py-4">
                <div className="balance-icon mb-3">
                  <i className="bi bi-cash-coin text-primary fs-2"></i>
                </div>
                <h5 className="card-title mb-2">Долар США (USD)</h5>
                <p className="balance-value fs-4">
                  {formatCurrency(balances.USD, "USD")}
                </p>
                <small className="text-muted">Оновлено: сьогодні</small>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card balance-card bg-dark text-light shadow">
              <div className="card-body text-center py-4">
                <div className="balance-icon mb-3">
                  <i className="bi bi-coin text-success fs-2"></i>
                </div>
                <h5 className="card-title mb-2">Криптовалюта (BTC)</h5>
                <p className="balance-value fs-4">{balances.BTC} BTC</p>
                <small className="text-muted">Оновлено: сьогодні</small>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default BalanceSection;
