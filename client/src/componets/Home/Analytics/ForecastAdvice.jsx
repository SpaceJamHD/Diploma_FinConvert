import React, { useEffect, useState } from "react";
import SpreadLossAdvice from "./SpreadLossAdvice";
import generateFinalAdvice from "./generateFinalAdvice";
import generateGoalPriorityAdvice from "./generateGoalPriorityAdvice";
import generateSmartGoalAdvice from "./generateSmartGoalAdvice";

import { Card } from "react-bootstrap";
import "../../../styles/bootstrap/css/bootstrap.min.css";
import "../../../styles/dark-scrollbar.css";
import axiosInstance from "../../../utils/axiosInstance";

const ForecastAdvice = () => {
  const [forecastData, setForecastData] = useState(null);
  const [dynamicAdvice, setDynamicAdvice] = useState([]);
  const [goalAdvice, setGoalAdvice] = useState([]);
  const [smartGoalAdvice, setSmartGoalAdvice] = useState([]);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const res = await axiosInstance.get("/api/analytics/forecast");
        const data = res.data;
        setForecastData(data);
      } catch (error) {
        console.error("Помилка отримання прогнозу:", error);
      }
    };

    fetchForecast();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [goalsRes, plansRes] = await Promise.all([
          axiosInstance.get("/api/goals"),
          axiosInstance.get("/api/auto-goal-plans"),
        ]);

        const goals = goalsRes.data;
        const autoPlans = plansRes.data;

        setGoalAdvice(generateGoalPriorityAdvice(goals));
        setSmartGoalAdvice(generateSmartGoalAdvice(goals, autoPlans));
      } catch (error) {
        console.error("Помилка завантаження цілей або планів:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (forecastData) {
      setDynamicAdvice(generateFinalAdvice(forecastData));
    }
  }, [forecastData]);

  const allAdvice = [...dynamicAdvice, ...goalAdvice, ...smartGoalAdvice];

  const uniqueAdvice = Array.from(
    new Map(
      allAdvice.map((item) => [item.id || item.text.trim().toLowerCase(), item])
    ).values()
  );

  if (!forecastData || uniqueAdvice.length === 0) return null;

  const iconMap = {
    budget: "bi-cash-coin",
    warning: "bi-exclamation-triangle-fill",
    positive: "bi-graph-up-arrow",
    alert: "bi-exclamation-octagon-fill",
    info: "bi-info-circle-fill",
    neutral: "bi-compass",
    critical: "bi-exclamation-diamond-fill",
  };

  return (
    <section id="forecast-advice" className="mb-5">
      <div
        className="card bg-dark text-light shadow-lg p-4"
        style={{ height: "540px", overflowY: "auto" }}
      >
        <h5 className="mb-4">Фінансові підказки на основі прогнозу</h5>
        <div className="d-flex flex-column gap-3 mt-2">
          <SpreadLossAdvice />
          {uniqueAdvice.map((item, index) => (
            <Card key={index} className="goal-advice-card">
              <div className="goal-advice-card-inner">
                <span className="goal-advice-icon">
                  <i
                    className={`bi ${iconMap[item.type || "info"]}`}
                    style={{ fontSize: "1.2rem", color: "#ffc107" }}
                  ></i>
                </span>
                <p className="goal-advice-text mb-0">{item.text}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ForecastAdvice;
