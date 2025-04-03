import { useEffect, useState } from "react";

const useForecastTrends = (forecastData) => {
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
    } = forecastData;

    const trends = new Map();

    if (expenses > income && expenses > balance * 0.4) {
      trends.set("trend-expenses-over-40-balance", {
        id: "trend-expenses-over-40-balance",
        text: "Ваші витрати склали понад 40% від балансу — перегляньте, на що саме витрачаєте.",
        type: "critical",
        category: "expenses",
      });
    }

    if (expectedBalance < balance && (income > 0 || expenses > 0)) {
      trends.set("trend-balance-drop", {
        id: "trend-balance-drop",
        text: "Очікується зменшення загального балансу — зменшіть витрати або спробуйте збільшити доходи.",
        type: "warning",
        category: "balance",
      });
    }

    if (income > 0 && income < 1000) {
      trends.set("trend-income-low", {
        id: "trend-income-low",
        text: "Ваш дохід менше 1000 грн — це може бути нестабільно. Подумайте про нові джерела прибутку.",
        type: "info",
        category: "income",
      });
    }

    if (income === 0 && expenses === 0) {
      trends.set("trend-no-activity", {
        id: "trend-no-activity",
        text: "Жодної фінансової активності не зафіксовано — додайте транзакції, щоб покращити аналіз.",
        type: "neutral",
        category: "activity",
      });
    }

    setAdvice(Array.from(trends.values()));
  }, [forecastData]);

  return advice;
};

export default useForecastTrends;
