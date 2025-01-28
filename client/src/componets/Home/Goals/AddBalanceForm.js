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

  const handleAddBalance = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      alert("Введите корректную сумму!");
      return;
    }

    try {
      setIsLoading(true);
      let convertedAmount = parseFloat(amount);

      // 🔄 Если пополняем не в той же валюте, делаем конвертацию
      if (fromCurrency !== currentCurrency) {
        convertedAmount = await fetchConvertedAmount(
          fromCurrency,
          currentCurrency,
          amount
        );
      }

      console.log("➡️ Исходные данные:", {
        amount: parseFloat(amount),
        fromCurrency,
        currentCurrency,
      });
      console.log("🔄 Конвертированная сумма:", convertedAmount);

      const response = await fetch(`/api/goals/${goalId}/add-balance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          amount: convertedAmount,
          fromCurrency,
        }),
      });

      if (!response.ok) {
        throw new Error("Ошибка при обновлении баланса");
      }

      const data = await response.json();
      console.log("✅ Сервер ответил:", data);

      // 🔄 Обновляем баланс кошелька
      refreshWallet();

      onSave(data.updatedBalance);
      setIsLoading(false);
      onClose();
    } catch (error) {
      console.error("❌ Ошибка при добавлении баланса:", error);
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
        <h3 style={{ marginBottom: "20px" }}>Пополнение цели</h3>

        {/* Поле ввода с валютой справа */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Введите сумму"
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

        {/* Кнопки */}
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
            {isLoading ? "Добавление..." : "Добавить"}
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
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBalanceForm;
