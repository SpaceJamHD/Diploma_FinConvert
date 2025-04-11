const useAdviceTopUps = (goal, transactions, balances) => {
  const tips = [];

  if (!goal || !goal.id) return tips;

  const incomeTx = transactions.filter((t) => t.type === "income");

  if (incomeTx.length === 0) {
    tips.push(
      "У цілі немає жодного поповнення. Рекомендується зробити перший внесок."
    );
    return tips;
  }

  const now = new Date();
  const recentTopUps = incomeTx.filter((t) => {
    const date = new Date(t.date);
    return now - date <= 30 * 24 * 60 * 60 * 1000;
  });

  const avgAmount =
    recentTopUps.length > 0
      ? recentTopUps.reduce(
          (sum, t) => sum + parseFloat(t.original_amount || t.amount),
          0
        ) / recentTopUps.length
      : 0;

  if (recentTopUps.length === 1) {
    tips.push(
      "Було лише одне поповнення за останній місяць. Регулярність — ключ до досягнення цілі."
    );
  } else if (recentTopUps.length < 3) {
    tips.push(
      "Ціль поповнюється рідко. Розгляньте встановлення регулярного графіку внесків."
    );
  } else if (recentTopUps.length >= 6) {
    tips.push(
      "Ціль активно поповнюється — це чудово! Продовжуйте в тому ж темпі."
    );
  }

  if (avgAmount > 0 && avgAmount < goal.amount * 0.05) {
    tips.push(
      `Середня сума поповнення (${avgAmount.toFixed(2)} ${
        goal.currency
      }) є досить низькою. Можливо, варто збільшити внески.`
    );
  } else if (avgAmount > goal.amount * 0.2) {
    tips.push("Ваші внески досить суттєві. Ви швидко рухаєтесь до мети!");
  }

  if (balances[goal.currency] && balances[goal.currency] >= goal.amount * 0.1) {
    tips.push(
      "У вас є доступні кошти на гаманці. Розгляньте можливість додаткового поповнення цілі."
    );
  }

  if (balances[goal.currency] < goal.amount * 0.02) {
    tips.push(
      "Залишок на гаманці в валюті цілі низький. Поповнення може бути складним без попередньої конверсії."
    );
  }

  return tips;
};

export default useAdviceTopUps;
