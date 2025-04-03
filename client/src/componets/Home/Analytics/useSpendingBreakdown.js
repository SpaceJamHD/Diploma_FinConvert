import { useEffect, useState } from "react";

const useSpendingBreakdown = (forecastData) => {
  const [spendingAdvice, setSpendingAdvice] = useState([]);

  useEffect(() => {
    if (!forecastData) {
      setSpendingAdvice([]);
      return;
    }

    const { expenses = 0, income = 0, balance = 0 } = forecastData;
    const adviceMap = new Map();

    if (income > 0 && expenses > income) {
      adviceMap.set("spend-more-than-income", {
        id: "spend-more-than-income",
        text: `Ваші витрати перевищують доходи на ${(expenses - income).toFixed(
          2
        )} грн — перегляньте бюджет.`,
        type: "warning",
        category: "spending",
      });
    }

    if (expenses === 0) {
      adviceMap.set("no-spending-this-month", {
        id: "no-spending-this-month",
        text: "У цьому місяці не було витрат — можливо, це помилка або ще не настав час витрачати.",
        type: "info",
        category: "spending",
      });
    }

    if (expenses > 0 && expenses < 500) {
      adviceMap.set("very-low-spending", {
        id: "very-low-spending",
        text: "Ваші витрати дуже низькі. Якщо це свідоме — чудово. Але перевірте, чи не забули ви про щось.",
        type: "neutral",
        category: "spending",
      });
    }

    if (expenses > 0 && balance > 0 && (expenses / balance) * 100 < 30) {
      adviceMap.set("spending-under-30-percent", {
        id: "spending-under-30-percent",
        text: "Витрати склали менше 30% балансу — гарний рівень фінансового контролю.",
        type: "positive",
        category: "spending",
      });
    }

    if (balance > 0 && (expenses / balance) * 100 > 70) {
      adviceMap.set("spending-over-70-percent", {
        id: "spending-over-70-percent",
        text: "Ви витратили понад 70% балансу — це ризиковано у разі несподіваних витрат.",
        type: "critical",
        category: "spending",
      });
    }

    setSpendingAdvice(Array.from(adviceMap.values()));
  }, [forecastData]);

  return spendingAdvice;
};

export default useSpendingBreakdown;
