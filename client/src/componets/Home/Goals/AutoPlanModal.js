import React, { useState } from "react";
import "../../../styles/autoPlan.css";

const AutoPlanModal = ({ goals, onClose }) => {
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [amount, setAmount] = useState(0);
  const [fromCurrency, setFromCurrency] = useState("UAH");
  const [frequency, setFrequency] = useState("daily");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const selectedGoal = goals.find((goal) => goal.id === selectedGoalId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGoalId || !amount || !startDate || !endDate) {
      alert("Будь ласка, заповніть всі поля.");
      return;
    }

    try {
      const response = await fetch("/api/auto-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          goal_id: selectedGoalId,
          amount,
          currency: fromCurrency,
          frequency,
          start_date: startDate,
          end_date: endDate,
        }),
      });

      if (!response.ok) {
        throw new Error("Помилка створення автоматичного плану");
      }

      if (!response.ok) {
        throw new Error("Помилка створення автоматичного плану");
      }

      alert("Автоплан успішно створено!");
      onClose();
    } catch (error) {
      console.error(" Помилка створення автоплану:", error);
    }
  };

  return (
    <div className="auto-modal-overlay">
      <div className="auto-modal">
        <h3>Налаштування авто поповнення</h3>

        <div className="auto-select-goal">
          <label>Оберіть ціль:</label>
          <select
            value={selectedGoalId || ""}
            onChange={(e) => setSelectedGoalId(parseInt(e.target.value))}
          >
            <option value="">-- Обрати ціль --</option>
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.name}
              </option>
            ))}
          </select>
        </div>

        {selectedGoal && (
          <form onSubmit={handleSubmit} className="auto-form">
            <div className="auto-info-row">
              <div>
                <span>Ціль:</span> {selectedGoal.name} ({selectedGoal.currency})
              </div>
              <div>
                <span>Залишок:</span>{" "}
                {(selectedGoal.amount - selectedGoal.balance).toFixed(2)}{" "}
                {selectedGoal.currency}
              </div>
            </div>

            <div className="auto-row">
              <div className="auto-field">
                <label>Сума поповнення</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="auto-field">
                <label>Валюта поповнення</label>
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                >
                  <option value="UAH">UAH</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="BTC">BTC</option>
                </select>
              </div>
            </div>

            <div className="auto-row">
              <div className="auto-field">
                <label>Періодичність</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                >
                  <option value="daily">Щодня</option>
                  <option value="weekly">Щотижня</option>
                  <option value="monthly">Щомісяця</option>
                </select>
              </div>
            </div>

            <div className="auto-row">
              <div className="auto-field">
                <label>Початкова дата</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="auto-field">
                <label>Кінцева дата</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auto-buttons">
              <button type="submit">Зберегти</button>
              <button type="button" onClick={onClose} className="cancel">
                Скасувати
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AutoPlanModal;
