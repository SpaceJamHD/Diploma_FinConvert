import React, { useState, useEffect } from "react";
import { fetchConvertedAmount, getExchangeRate } from "../../../utils/api";
import axiosInstance from "../../../utils/axiosInstance";

const AddBalanceForm = ({
  goalId,
  currentCurrency,
  refreshWallet,
  onClose,
  onSave,
}) => {
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("UAH");
  const [isLoading, setIsLoading] = useState(false);
  const [spreadLoss, setSpreadLoss] = useState(0);

  useEffect(() => {
    const calculateSpread = async () => {
      const numericAmount = normalizeAmount(amount);
      if (!numericAmount || fromCurrency === currentCurrency) {
        setSpreadLoss(0);
        return;
      }

      try {
        const rate = await getExchangeRate(fromCurrency, currentCurrency);
        if (!rate) return;

        let spreadPercent =
          fromCurrency === "BTC" || currentCurrency === "BTC" ? 0.015 : 0.005;

        const expected = numericAmount * rate;
        const actual = numericAmount * rate * (1 - spreadPercent);

        const loss =
          currentCurrency === "BTC"
            ? (expected - actual).toFixed(8)
            : (expected - actual).toFixed(2);

        setSpreadLoss(parseFloat(loss));
      } catch (e) {
        console.error("Помилка при розрахунку спреду:", e);
        setSpreadLoss(0);
      }
    };

    calculateSpread();
  }, [amount, fromCurrency, currentCurrency]);

  const normalizeAmount = (value) => {
    const cleaned = value.replace(/\s+/g, "").replace(",", ".");
    return parseFloat(cleaned);
  };

  const handleAddBalance = async () => {
    if (isLoading) return;
    setIsLoading(true);

    const numericAmount = normalizeAmount(amount);

    if (!numericAmount || numericAmount <= 0 || isNaN(numericAmount)) {
      alert("Введіть, будь ласка, коректну суму!");
      setIsLoading(false);
      return;
    }

    try {
      let convertedAmount = numericAmount;
      let isConverted = false;

      if (fromCurrency !== currentCurrency) {
        console.log(
          ` Конвертація: ${numericAmount} ${fromCurrency} → ${currentCurrency}`
        );
        convertedAmount = await fetchConvertedAmount(
          fromCurrency,
          currentCurrency,
          numericAmount
        );

        if (!convertedAmount || isNaN(convertedAmount)) {
          alert("Помилка під час конвертації. Спробуйте пізніше.");
          setIsLoading(false);
          return;
        }

        isConverted = true;
      }

      const response = await axiosInstance.post(
        `/api/goals/${goalId}/add-balance`,
        {
          originalAmount: numericAmount,
          convertedAmount,
          fromCurrency,
          converted: isConverted,
        }
      );

      const { data } = response;

      if (!data || !data.updatedBalance) {
        console.error("Сервер не повернув оновлений баланс");
        setIsLoading(false);
        return;
      }

      refreshWallet();
      onSave(data.updatedBalance);
      setIsLoading(false);
      onClose();
    } catch (error) {
      console.error(" Помилка при додаванні балансу:", error);
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <form
        style={{
          backgroundColor: "#1a1a1a",
          color: "#ffd700",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
          width: "400px",
          textAlign: "center",
        }}
        onSubmit={(e) => {
          e.preventDefault();
          handleAddBalance();
        }}
      >
        <h3 style={{ marginBottom: "20px" }}>Поповнення цілі</h3>
        {spreadLoss > 0 && (
          <div
            style={{
              fontSize: "0.75rem",
              color: "#dc3545",
              textAlign: "right",
              marginTop: "10px",
            }}
          >
            Втрати через спред: {spreadLoss} {currentCurrency}
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Введіть суму"
            required
            style={{
              flex: 1,
              padding: "10px",
              backgroundColor: "#333",
              border: "1px solid #555",
              borderRadius: "5px 0 0 5px",
              textAlign: "center",
              fontSize: "1rem",
            }}
          />

          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            required
            style={{
              backgroundColor: "#333",
              color: "#ffd700",
              padding: "10px",
              border: "1px solid #555",
              borderRadius: "0 5px 5px 0",
              fontSize: "1rem",
              minWidth: "80px",
            }}
          >
            <option value="UAH">UAH</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="BTC">BTC</option>
          </select>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              flex: 1,
              backgroundColor: "#28a745",
              color: "#fff",
              padding: "10px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginRight: "10px",
            }}
          >
            {isLoading ? "Додаємо..." : "Додати"}
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              backgroundColor: "#dc3545",
              color: "#fff",
              padding: "10px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Відміна
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBalanceForm;
