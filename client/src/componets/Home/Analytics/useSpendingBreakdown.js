import { useEffect, useState } from "react";

const useSpendingBreakdown = (forecastData) => {
  const [spendingAdvice, setSpendingAdvice] = useState([]);

  useEffect(() => {
    if (!forecastData) {
      setSpendingAdvice([]);
      return;
    }

    const { expenses = 0, income = 0, balance = 0 } = forecastData;
    const advice = [];

    if (expenses > income && income > 0) {
      advice.push({
        text: `Ваші витрати перевищують доходи на ${(expenses - income).toFixed(
          2
        )} грн. Спробуйте скоротити необов’язкові витрати.`,
      });
    }

    if (expenses > 0 && balance > 0) {
      const spendingRatio = (expenses / balance) * 100;

      if (spendingRatio > 70) {
        advice.push({
          text: `Ви витратили понад 70% вашого балансу. Це може бути ризиковано у разі непередбачених витрат.`,
        });
      } else if (spendingRatio < 30) {
        advice.push({
          text: ` Витрати склали менше 30% балансу — гарний рівень керування фінансами!`,
        });
      }
    }

    if (expenses === 0) {
      advice.push({
        text: ` Ви ще нічого не витратили цього місяця. Перевірте, чи це не помилка або заплануйте витрати.`,
      });
    }

    if (expenses > 0 && expenses < 500) {
      advice.push({
        text: `Ваші витрати дуже низькі. Якщо це свідоме рішення — чудово! Але варто перевірити, чи не забули ви щось важливе.`,
      });
    }

    setSpendingAdvice((prev) => {
      const prevText = prev.map((item) => item.text).join();
      const newText = advice.map((item) => item.text).join();
      return prevText === newText ? prev : advice;
    });
  }, [forecastData]);

  return spendingAdvice;
};

export default useSpendingBreakdown;
