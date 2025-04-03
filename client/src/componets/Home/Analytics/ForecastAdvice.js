import React, { useEffect, useState } from "react";
import useForecastTrends from "./useForecastTrends";
import useSpendingBreakdown from "./useSpendingBreakdown";
import useAnomalyDetection from "./useAnomalyDetection";
import SpreadLossAdvice from "./SpreadLossAdvice";
import generateDynamicAdvice from "./generateDynamicAdvice";
import { Card } from "react-bootstrap";
import "../../../styles/bootstrap/css/bootstrap.min.css";

const ForecastAdvice = () => {
  const [forecastData, setForecastData] = useState(null);
  const [dynamicAdvice, setDynamicAdvice] = useState([]);

  const trendsAdvice = useForecastTrends(forecastData);
  const breakdownAdvice = useSpendingBreakdown(forecastData);
  const anomalyAdvice = useAnomalyDetection(forecastData);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const res = await fetch("/api/analytics/forecast", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        setForecastData(data);
      } catch (error) {
        console.error("Помилка отримання прогнозу:", error);
      }
    };

    fetchForecast();
  }, []);

  useEffect(() => {
    if (forecastData) {
      setDynamicAdvice(generateDynamicAdvice(forecastData));
    }
  }, [forecastData]);

  const allAdvice = [
    ...dynamicAdvice,
    ...trendsAdvice,
    ...breakdownAdvice,
    ...anomalyAdvice,
  ];

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
