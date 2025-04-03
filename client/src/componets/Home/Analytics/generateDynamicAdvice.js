const generateDynamicAdvice = ({
  income = 0,
  expenses = 0,
  expectedBalance = 0,
  balanceChangePercent = 0,
}) => {
  const advice = [];
  const percent = parseFloat(balanceChangePercent);
  const surplus = income - expenses;

  if (!isNaN(percent) && percent < -5) {
    advice.push({
      id: "balance-drop-5",
      text: `Баланс може зменшитися на ${Math.abs(percent).toFixed(
        1
      )}% — зверніть увагу.`,
      type: "warning",
      category: "forecast",
    });
  }

  if (surplus > 0) {
    advice.push({
      id: "surplus-positive",
      text: `Є профіцит ${surplus.toFixed(
        2
      )} грн — можна відкласти або інвестувати.`,
      type: "positive",
      category: "budget",
    });
  }

  if (income === 0) {
    advice.push({
      id: "no-income",
      text: "Немає доходу за місяць — перевірте або додайте поповнення.",
      type: "alert",
      category: "income",
    });
  }

  if (expenses === 0) {
    advice.push({
      id: "no-expenses",
      text: "Немає витрат — перевірте дані або насолоджуйтесь економією.",
      type: "info",
      category: "expenses",
    });
  }

  if (Math.abs(percent) < 1 && income > 0 && expenses > 0) {
    advice.push({
      id: "stable-balance",
      text: "Баланс стабільний — підтримуйте обережний підхід.",
      type: "neutral",
      category: "forecast",
    });
  }

  return advice;
};

export default generateDynamicAdvice;
