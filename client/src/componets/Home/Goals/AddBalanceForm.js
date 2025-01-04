import React, { useState } from "react";

const AddBalanceForm = ({ goalId, currentCurrency, onClose, onSave }) => {
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState(currentCurrency || "UAH");

  const handleAddBalance = async () => {
    if (!amount || isNaN(amount)) {
      alert("Введите корректную сумму!");
      return;
    }

    try {
      const response = await fetch(`/api/goals/${goalId}/add-balance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ amount, fromCurrency }), // Передаем сумму и валюту пополнения
      });

      if (!response.ok) {
        throw new Error("Ошибка при обновлении баланса");
      }

      const data = await response.json();
      onSave(data.updatedBalance);
    } catch (error) {
      console.error("Ошибка при добавлении баланса:", error);
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
        }}
        onSubmit={(e) => {
          e.preventDefault();
          handleAddBalance();
        }}
      >
        <h3>Добавить сумму в баланс</h3>
        <label>Сумма</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
        />
        <label>Валюта</label>
        <select
          value={fromCurrency}
          onChange={(e) => setFromCurrency(e.target.value)}
          style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
        >
          <option value="UAH">Гривна (UAH)</option>
          <option value="USD">Доллар (USD)</option>
          <option value="EUR">Евро (EUR)</option>
        </select>
        <button
          type="submit"
          style={{
            backgroundColor: "#28a745",
            color: "#fff",
            padding: "10px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          Добавить
        </button>
        <button
          type="button"
          onClick={onClose}
          style={{
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
      </form>
    </div>
  );
};

export default AddBalanceForm;
