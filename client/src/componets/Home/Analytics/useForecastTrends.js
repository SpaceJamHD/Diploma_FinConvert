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

    const trends = [];

    if (expenses > income && expenses > balance * 0.4) {
      trends.push({
        text: `Ваші витрати за місяць склали понад 40% від поточного балансу — перегляньте витрати.`,
      });
    }

    if (expectedBalance < balance) {
      trends.push({
        text: `Очікується зменшення загального балансу — варто скоротити витрати або знайти нові джерела доходів.`,
      });
    }

    if (income < 1000 && income > 0) {
      trends.push({
        text: `Дохід менше 1000 грн — нестабільна ситуація. Можливо, варто підвищити джерело прибутку.`,
      });
    }

    if (income === 0 && expenses === 0) {
      trends.push({
        text: ` Не зафіксовано жодної фінансової активності — додайте транзакції для точнішого аналізу.`,
      });
    }

    setAdvice(trends);
  }, [forecastData]);

  return advice;
};

export default useForecastTrends;
