import React, { useEffect, useState } from "react";
import useForecastTrends from "./useForecastTrends";
import useSpendingBreakdown from "./useSpendingBreakdown";
import useAnomalyDetection from "./useAnomalyDetection";
import { Card } from "react-bootstrap";

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

  const generateDynamicAdvice = ({
    income,
    expenses,
    expectedBalance,
    balanceChangePercent,
  }) => {
    const advice = [];
    const percent = parseFloat(balanceChangePercent);
    const surplus = income - expenses;

    if (expenses > 0 && income > 0 && expenses / income > 0.6) {
      advice.push({
        text: `Ваші витрати становлять більше 60% від доходу — можливо, варто переглянути бюджет.`,
        type: "budget",
      });
    }

    if (!isNaN(percent) && percent < -5) {
      advice.push({
        text: `Ваш баланс може зменшитися на ${Math.abs(percent).toFixed(
          1
        )}%. Спробуйте скоротити витрати або знайти додаткове джерело доходу.`,
        type: "warning",
      });
    }

    if (surplus > 0) {
      advice.push({
        text: `Ваші доходи перевищують витрати. Можна планувати відкласти ${surplus.toFixed(
          2
        )} грн.`,
        type: "positive",
      });
    }

    if (income === 0) {
      advice.push({
        text: `Немає надходжень за останній місяць. Заплануйте поповнення або нове джерело доходу.`,
        type: "alert",
      });
    }

    if (expenses === 0) {
      advice.push({
        text: `Не зафіксовано витрат. Якщо це помилка — перевірте дані. Якщо ні — супер!`,
        type: "info",
      });
    }

    if (Math.abs(percent) < 1) {
      advice.push({
        text: `Ваш баланс майже не змінився. Стабільність — це добре, але подумайте про розвиток.`,
        type: "neutral",
      });
    }

    if (expenses / (income || 1) > 0.8) {
      advice.push({
        text: `Ви витрачаєте понад 80% доходу. Це небезпечно при форс-мажорах — скоротіть витрати.`,
        type: "critical",
      });
    }

    return advice;
  };

  const allAdvice = [
    ...dynamicAdvice,
    ...trendsAdvice,
    ...breakdownAdvice,
    ...anomalyAdvice,
  ];

  const uniqueAdvice = Array.from(
    new Map(allAdvice.map((a) => [a.text, a])).values()
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
        <h5 className="mb-4 ">Фінансові підказки на основі прогнозу</h5>
        <div className="d-flex flex-column gap-3 mt-2">
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
