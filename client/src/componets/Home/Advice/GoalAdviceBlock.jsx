import React, { useEffect, useState } from "react";
import useGoalAdvice from "./useGoalAdvice";
import useWebSocket from "../../../hooks/useWebSocket";
import { Card, Collapse } from "react-bootstrap";
import "../../../styles/chart-tabs.css";
import "../../../styles/goalDetails.css";

const GoalAdviceBlock = ({ goal, transactions, balances, autoPlans }) => {
  const [advice, setAdvice] = useState({});
  const [openSections, setOpenSections] = useState({});

  const updateAdvice = async () => {
    const newAdvice = await useGoalAdvice(
      goal,
      transactions,
      balances,
      autoPlans
    );
    setAdvice(newAdvice);
  };

  useEffect(() => {
    updateAdvice();
  }, [goal, transactions, balances, autoPlans]);

  useWebSocket({
    onBalanceUpdate: () => updateAdvice(),
  });

  const handleRunAutoPlans = async () => {
    try {
      const res = await fetch("/api/auto-plan/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) throw new Error("Помилка при запуску автопланів");

      const result = await res.json();
      console.log("Результат автопланів:", result);

      updateAdvice();
    } catch (err) {
      console.error("Помилка автопоповнення:", err);
    }
  };

  if (!goal) return null;

  const filteredAdvice = Object.entries(advice).filter(
    ([_, tips]) => Array.isArray(tips) && tips.length > 0
  );

  const toggleSection = (category) => {
    setOpenSections((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  if (filteredAdvice.length === 0) {
    return (
      <section className="goal-advice-section">
        <h4 className="goal-advice-header"> Рекомендації щодо цілі</h4>
        <p className="text-muted text-center">
          Наразі немає активних порад для цієї цілі.
        </p>
      </section>
    );
  }

  return (
    <section className="goal-advice-section">
      <h4 className="goal-advice-header"> Рекомендації щодо цілі</h4>
      {filteredAdvice.map(([category, tips]) => {
        const criticalTips = tips.filter(
          (tip) =>
            tip.toLowerCase().includes("не має") ||
            tip.toLowerCase().includes("дуже мало") ||
            tip.toLowerCase().includes("не налаштоване")
        );

        const tipsToShow =
          criticalTips.length > 0 ? criticalTips : tips.slice(0, 3);

        return (
          <div key={category} className="mb-3 goal-advice-block">
            <div
              className="goal-advice-category-header"
              onClick={() => toggleSection(category)}
            >
              <span className="goal-advice-toggle-icon">
                {openSections[category] ? "▼" : "▶"}
              </span>{" "}
              {getCategoryTitle(category)}
            </div>

            <Collapse in={openSections[category]}>
              <div className="goal-advice-card-wrapper">
                <div className="d-flex flex-column gap-3 mt-2">
                  {tipsToShow.map((text, i) => (
                    <Card key={i} className="goal-advice-card">
                      <div className="goal-advice-card-inner">
                        <span className="goal-advice-icon">--</span>
                        <p className="goal-advice-text mb-0">{text}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </Collapse>
          </div>
        );
      })}
    </section>
  );
};

const getCategoryTitle = (key) => {
  const titles = {
    progress: "Прогрес",
    topup: "Поповнення",
    spending: "Витрати",
    currency: "Валюта та конвертація",
    balance: "Баланс користувача",
    auto: "Автопоповнення",
    priority: "Пріоритет цілі",
    deadline: "Дедлайн і темп",
  };
  return titles[key] || "Інше";
};

export default GoalAdviceBlock;
