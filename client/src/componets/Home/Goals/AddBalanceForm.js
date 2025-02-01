import React, { useState } from "react";
import { fetchConvertedAmount } from "../../../utils/api";

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

  // Функція для нормалізації введеної користувачем суми
  const normalizeAmount = (value) => {
    // Прибираємо зайві пробіли
    // Замінюємо кому (,) на крапку (.)
    // І лише потім парсимо в число
    const cleaned = value.replace(/\s+/g, "").replace(",", ".");
    return parseFloat(cleaned);
  };

  const handleAddBalance = async () => {
    if (isLoading) return;
    setIsLoading(true);

    // Використовуємо normalizAmount, щоб коректно зчитати число
    const numericAmount = normalizeAmount(amount);

    if (!numericAmount || numericAmount <= 0 || isNaN(numericAmount)) {
      alert("Введіть, будь ласка, коректну суму!");
      setIsLoading(false);
      return;
    }

    try {
      let convertedAmount = numericAmount;
      let isConverted = false; // false, якщо конвертація не потрібна

      // Якщо валюта відрізняється, викликаємо API для конвертації
      if (fromCurrency !== currentCurrency) {
        console.log(
          `🌍 Конвертація: ${numericAmount} ${fromCurrency} → ${currentCurrency}`
        );
        convertedAmount = await fetchConvertedAmount(
          fromCurrency,
          currentCurrency,
          numericAmount
        );
        isConverted = true;
      }

      // Далі надсилаємо на сервер
      const response = await fetch(`/api/goals/${goalId}/add-balance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          originalAmount: numericAmount, // 1000 (те, що ввів користувач)
          convertedAmount: convertedAmount, // 23.987 (результат клієнтської конвертації, якщо вона була)
          fromCurrency,
          converted: isConverted,
        }),
      });

      if (!response.ok) {
        throw new Error("Помилка при оновленні балансу");
      }

      const data = await response.json();
      console.log("✅ Сервер відповів:", data);

      // Оновити дані на фронті
      refreshWallet();
      onSave(data.updatedBalance);
      setIsLoading(false);
      onClose();
    } catch (error) {
      console.error("❌ Помилка при додаванні балансу:", error);
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
              color: "#fff",
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
