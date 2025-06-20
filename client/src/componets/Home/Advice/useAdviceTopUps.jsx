const useAdviceTopUps = (
  goal,
  transactions = [],
  balances = {},
  timeFrame = "half-year"
) => {
  const tips = [];
  if (!goal || !goal.id) return tips;

  const now = new Date();
  const periodStart =
    timeFrame === "year"
      ? new Date(now.setFullYear(now.getFullYear() - 1))
      : new Date(now.setMonth(now.getMonth() - 6));

  const incomeTx = transactions.filter(
    (t) => t.type === "income" && new Date(t.date) >= periodStart
  );

  if (incomeTx.length === 0) {
    return [
      "У цілі немає жодного поповнення за останні пів року. Рекомендується зробити перший внесок.",
    ];
  }

  const avgAmount =
    incomeTx.reduce(
      (sum, t) => sum + parseFloat(t.original_amount || t.amount),
      0
    ) / incomeTx.length;

  if (incomeTx.length === 1) {
    tips.push(
      "Було лише одне поповнення за пів року. Регулярність — ключ до досягнення цілі."
    );
  } else if (incomeTx.length < 3) {
    tips.push(
      "Ціль поповнюється рідко. Розгляньте встановлення регулярного графіку внесків."
    );
  } else if (incomeTx.length >= 6) {
    tips.push(
      "Ціль активно поповнюється — це чудово! Продовжуйте в тому ж темпі."
    );
  }

  if (avgAmount < goal.amount * 0.05) {
    tips.push(
      `Середня сума поповнення (${avgAmount.toFixed(2)} ${
        goal.currency
      }) є досить низькою. Можливо, варто збільшити внески.`
    );
  } else if (avgAmount > goal.amount * 0.2) {
    tips.push(
      "Ваші внески досить суттєві. Ви швидко рухаєтесь до мети — збережіть цей темп!"
    );
  }

  if (balances[goal.currency] >= goal.amount * 0.1) {
    tips.push(
      "У вас є вільні кошти на гаманці. Розгляньте можливість поповнення цілі."
    );
  } else if (balances[goal.currency] < goal.amount * 0.02) {
    tips.push(
      "Баланс на гаманці дуже малий — може знадобитись конвертація для поповнення цілі."
    );
  }

  return tips;
};

export default useAdviceTopUps;
