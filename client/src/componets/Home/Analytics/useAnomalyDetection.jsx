import { useEffect, useState } from "react";

const useAnomalyDetection = (forecastData) => {
  const [advice, setAdvice] = useState([]);

  useEffect(() => {
    if (!forecastData) {
      setAdvice([]);
      return;
    }

    const {
      income = 0,
      expenses = 0,
      balance = 0,
      expectedBalance = 0,
      balanceChangePercent = 0,
    } = forecastData;

    const result = new Map();
    const percentChange = parseFloat(balanceChangePercent);

    if (!isNaN(percentChange) && percentChange < -40) {
      result.set("anomaly-drop-40", {
        id: "anomaly-drop-40",
        text: "Різке падіння балансу понад 40%. Перевірте, чи немає непередбачених витрат або шахрайства.",
        type: "warning",
        category: "anomaly",
      });
    }

    if (income > 0 && expenses > 0 && income / expenses > 3) {
      result.set("anomaly-income-x3", {
        id: "anomaly-income-x3",
        text: "Доходи цього місяця суттєво перевищують витрати — можливо, варто переосмислити фінансову стратегію.",
        type: "info",
        category: "anomaly",
      });
    }

    if (expenses > 0 && balance > 0 && expenses / balance < 0.05) {
      result.set("anomaly-expenses-low", {
        id: "anomaly-expenses-low",
        text: "Витрати цього місяця дуже низькі — перевірте, чи всі витрати враховано правильно.",
        type: "info",
        category: "expenses",
      });
    }

    if (expectedBalance > balance * 1.5 && income > 0) {
      result.set("anomaly-expected-high", {
        id: "anomaly-expected-high",
        text: "Прогнозований баланс значно вищий за поточний. Можливо, ви очікуєте великі надходження — сплануйте їх використання.",
        type: "info",
        category: "balance",
      });
    }

    setAdvice(Array.from(result.values()));
  }, [forecastData]);

  return advice;
};

export default useAnomalyDetection;
