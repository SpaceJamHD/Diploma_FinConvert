import React from "react";
import useExchangeRates from "../../hooks/useExchangeRates";

const CurrencyForecast = () => {
  const exchangeRates = useExchangeRates();

  return (
    <main className="container mt-5 mb-5">
      <section id="currency-forecast" className="mb-5 mt-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="text-light mb-0">Прогнозування валют та ризиків</h2>
          <a
            href="#"
            className="text-warning text-decoration-none d-flex align-items-center"
          >
            Детальніше <i className="bi bi-arrow-right-circle ms-2 fs-4"></i>
          </a>
        </div>
        <div className="row gy-4">
          <div className="col-md-3">
            <div className="forecast-card shadow">
              <div className="forecast-body text-center">
                <div className="forecast-icon mb-3">
                  <i className="bi bi-currency-dollar"></i>
                </div>
                <h5 className="forecast-title">USD</h5>
                <p className="forecast-value">{exchangeRates.usdToUah} ₴</p>
                <small className="forecast-updated">
                  {exchangeRates.updateTime}
                </small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="forecast-card shadow">
              <div className="forecast-body text-center">
                <div className="forecast-icon mb-3">
                  <i className="bi bi-currency-euro"></i>
                </div>
                <h5 className="forecast-title">EUR</h5>
                <p className="forecast-value">{exchangeRates.eurToUah} ₴</p>
                <small className="forecast-updated">
                  {exchangeRates.updateTime}
                </small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="forecast-card shadow">
              <div className="forecast-body text-center">
                <div className="forecast-icon mb-3">
                  <i className="bi bi-currency-bitcoin"></i>
                </div>
                <h5 className="forecast-title">BTC</h5>
                <p className="forecast-value">{exchangeRates.btcToUah} ₴</p>
                <small className="forecast-updated">
                  {exchangeRates.updateTime}
                </small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="forecast-card shadow">
              <div className="forecast-body text-center">
                <div className="forecast-icon mb-3">
                  <i className="bi bi-lightbulb"></i>
                </div>
                <h5 className="forecast-title">ETH</h5>
                <p className="forecast-value">{exchangeRates.ethToUah} ₴</p>
                <small className="forecast-updated">
                  {exchangeRates.updateTime}
                </small>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default CurrencyForecast;
