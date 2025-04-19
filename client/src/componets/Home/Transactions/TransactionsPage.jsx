import { useEffect, useState } from "react";
import BalanceSection from "../Balance/BalanceSection";
import { createTransaction, getExchangeRate } from "../../../utils/api";
import "../../../styles/bootstrap/css/bootstrap.min.css";
import "../../../styles/HomePage.css";

const TransactionsPage = () => {
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("UAH");
  const [toCurrency, setToCurrency] = useState("USD");
  const [spreadLoss, setSpreadLoss] = useState(0);
  const [convertedAmount, setConvertedAmount] = useState("");
  const [showPastTransactions, setShowPastTransactions] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    const calculateSpreadLoss = async () => {
      if (!amount || parseFloat(amount) <= 0 || fromCurrency === toCurrency) {
        setSpreadLoss(0);
        setConvertedAmount("");
        return;
      }

      try {
        const rate = await getExchangeRate(fromCurrency, toCurrency);
        if (!rate || isCancelled) return;

        let spreadPercent = 0.005;
        if (fromCurrency === "BTC" || toCurrency === "BTC") {
          spreadPercent = 0.015;
        }

        const expectedAmount = parseFloat(amount) * rate;
        const adjustedRate = rate * (1 - spreadPercent);
        const actualAmount = parseFloat(amount) * adjustedRate;

        setSpreadLoss(expectedAmount - actualAmount);
        setConvertedAmount(actualAmount.toFixed(toCurrency === "BTC" ? 8 : 2));
      } catch (error) {
        console.error("Ошибка при расчёте спреда:", error);
      }
    };

    calculateSpreadLoss();
    return () => {
      isCancelled = true;
    };
  }, [amount, fromCurrency, toCurrency]);

  useEffect(() => {
    const savedTx = localStorage.getItem("lastTransaction");
    if (savedTx) {
      setLastTransaction(JSON.parse(savedTx));
    }
  }, []);

  useEffect(() => {
    if (lastTransaction) {
      localStorage.setItem("lastTransaction", JSON.stringify(lastTransaction));
    }
  }, [lastTransaction]);

  const handleTransaction = async () => {
    try {
      const newTx = await createTransaction(
        parseFloat(amount),
        fromCurrency,
        toCurrency,
        "перевод"
      );

      setLastTransaction({
        from: newTx.from_currency,
        to: newTx.to_currency,
        amount: newTx.amount,
      });

      setAmount("");
    } catch (error) {
      alert("Ошибка при создании транзакции");
    }
  };

  const currencies = ["UAH", "USD", "EUR", "BTC", "ETH"];

  return (
    <div className="container mt-4">
      <BalanceSection hideViewAll={true} />

      <div className="w-100 d-flex justify-content-center">
        <div
          className="conversion-card shadow-lg p-4"
          style={{ maxWidth: "520px", width: "100%" }}
        >
          <h5 className="text-light mb-3">Остання транзакція</h5>

          <div className="transaction-item d-flex justify-content-between align-items-center p-4 mb-3">
            <div className="profile-icon d-flex align-items-center gap-2">
              <i
                className="bi bi-person-circle text-light"
                style={{ fontSize: "2rem" }}
              ></i>
              <span className="text-light fw-bold">Ви:</span>
            </div>
            <div className="exchange-section d-flex align-items-center justify-content-center gap-4">
              <div className="currency-box d-flex flex-column align-items-center">
                <span className="currency-code text-warning">
                  {lastTransaction?.from || fromCurrency}
                </span>
                <small className="text-muted">Вихідна</small>
              </div>
              <div className="exchange-icon">
                <i
                  className="bi bi-arrow-left-right text-warning"
                  style={{ fontSize: "1.5rem" }}
                ></i>
              </div>
              <div className="currency-box d-flex flex-column align-items-center">
                <span className="currency-code text-primary">
                  {lastTransaction?.to || toCurrency}
                </span>
                <small className="text-muted">Отримувач</small>
              </div>
            </div>
            <div className="transaction-amount text-end">
              {lastTransaction?.amount
                ? `${parseFloat(lastTransaction.amount).toFixed(
                    lastTransaction.to === "BTC" ? 8 : 2
                  )} ${lastTransaction.to}`
                : "—"}

              <small className="d-block text-muted">Розрахунок</small>
            </div>
          </div>

          <h5 className="text-light mb-3 exchange-curs">Обмін валют</h5>

          <div className="exchange-card p-3 rounded shadow-lg mt-4">
            <div className="row g-0">
              <div className="col-6 border-end border-bottom d-flex flex-column align-items-center p-2">
                <div className="currency-box d-flex flex-column align-items-center gap-1">
                  <select
                    className="form-select bg-dark text-light mb-2"
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                  >
                    {currencies.map((cur) => (
                      <option key={cur} value={cur}>
                        {cur}
                      </option>
                    ))}
                  </select>
                  <input
                    className="form-control bg-dark text-light mt-1"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Введіть суму"
                  />
                </div>
              </div>

              <div className="col-6 border-bottom d-flex flex-column align-items-center p-2">
                <div className="currency-box d-flex flex-column align-items-center gap-1">
                  <select
                    className="form-select bg-dark text-light mb-2"
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                  >
                    {currencies.map((cur) => (
                      <option key={cur} value={cur}>
                        {cur}
                      </option>
                    ))}
                  </select>
                  <input
                    className="form-control bg-dark text-light mt-1"
                    type="text"
                    readOnly
                    value={convertedAmount}
                  />
                </div>
              </div>

              <div className="col-6 border-end d-flex flex-column align-items-center justify-content-center p-2">
                <p className="exchange-value mb-0 text-success fw-bold">
                  {amount} {fromCurrency}
                </p>
                <small className="text-muted">Відправляється</small>
              </div>
              <div className="col-6 d-flex flex-column align-items-center justify-content-center p-2">
                <p className="exchange-value mb-0 text-success fw-bold">
                  {convertedAmount} {toCurrency}
                </p>
                <small className="text-muted">Надходить</small>
              </div>
            </div>
          </div>

          {spreadLoss > 0 && (
            <div className="text-end text-danger mt-2">
              Втрати через спред:{" "}
              {spreadLoss.toFixed(toCurrency === "BTC" ? 8 : 2)} {toCurrency}
            </div>
          )}

          <button
            className="btn btn-success w-100 mt-4 py-2 fw-bold"
            onClick={handleTransaction}
          >
            Обміняти
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;
