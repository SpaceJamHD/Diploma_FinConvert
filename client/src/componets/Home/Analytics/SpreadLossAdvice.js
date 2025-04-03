import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";

const SpreadLossAdvice = () => {
  const [totalLossUAH, setTotalLossUAH] = useState(null);

  useEffect(() => {
    const fetchTotalLoss = async () => {
      try {
        const res = await fetch("/api/analytics/spread-total-loss-uah", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        setTotalLossUAH(data.total_loss);
      } catch (error) {
        console.error("Помилка при отриманні загальних втрат:", error);
      }
    };

    fetchTotalLoss();
  }, []);

  if (!totalLossUAH || totalLossUAH <= 0) return null;

  return (
    <Card className="goal-advice-card">
      <div className="goal-advice-card-inner">
        <span className="goal-advice-icon">
          <i
            className="bi bi-currency-exchange"
            style={{ fontSize: "1.2rem", color: "#dc3545" }}
          ></i>
        </span>
        <p className="goal-advice-text mb-0">
          Ви втратили <strong>{totalLossUAH.toFixed(2)} грн</strong> через спред
          під час конвертацій. Зменшіть кількість обмінів або комбінуйте валюти.
        </p>
      </div>
    </Card>
  );
};

export default SpreadLossAdvice;
