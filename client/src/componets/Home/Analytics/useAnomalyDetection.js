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

    const anomalies = [];

    const percentChange = parseFloat(balanceChangePercent);

    if (!isNaN(percentChange) && percentChange < -40) {
      anomalies.push({
        text: "Різке падіння балансу понад 40%. Перевірте, чи немає непередбачених витрат або шахрайства.",
      });
    }

    if (income > 0 && income > expenses * 3) {
      anomalies.push({
        text: " Доходи цього місяця втричі перевищили витрати — можливо, варто переосмислити фінансову стратегію.",
      });
    }

    if (expenses > 0 && balance > 0 && expenses < balance * 0.05) {
      anomalies.push({
        text: " Витрати цього місяця дуже низькі — перевірте, чи всі витрати враховано правильно.",
      });
    }

    if (expectedBalance > balance * 1.5 && income > 0) {
      anomalies.push({
        text: "Прогнозований баланс значно вищий за поточний. Можливо, ви очікуєте великі надходження — сплануйте їх використання.",
      });
    }

    setAdvice((prev) => {
      const prevText = prev.map((item) => item.text).join();
      const newText = anomalies.map((item) => item.text).join();
      return prevText === newText ? prev : anomalies;
    });
  }, [forecastData]);

  return advice;
};

export default useAnomalyDetection;
