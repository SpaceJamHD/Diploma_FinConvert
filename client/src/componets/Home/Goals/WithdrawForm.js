import React, { useState } from "react";
import { withdrawFromGoal } from "../../../utils/api";

const WithdrawForm = ({ goal, onClose, onWithdraw }) => {
  const [amount, setAmount] = useState("");

  const handleWithdraw = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      alert("Введите корректную сумму!");
      return;
    }

    try {
      const data = await withdrawFromGoal(goal.id, parseFloat(amount));
      onWithdraw(data.newBalance);
    } catch (error) {
      alert("Ошибка при снятии средств!");
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
      <div
        style={{
          backgroundColor: "#1a1a1a",
          color: "#ffd700",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
          width: "400px",
          textAlign: "center",
        }}
      >
        <h3 style={{ marginBottom: "20px" }}>Снятие денег</h3>

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
          <span
            style={{
              backgroundColor: "#333",
              color: "#ffd700",
              padding: "10px",
              border: "1px solid #555",
              borderRadius: "0 5px 5px 0",
              fontSize: "1rem",
              minWidth: "50px",
            }}
          >
            {goal.currency}
          </span>
        </div>

        {/* Кнопки в одну строку */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button
            onClick={handleWithdraw}
            style={{
              flex: 1,
              backgroundColor: "#dc3545",
              color: "#fff",
              padding: "10px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginRight: "10px",
            }}
          >
            Снять
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              backgroundColor: "#6c757d",
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
      </div>
    </div>
  );
};

export default WithdrawForm;
