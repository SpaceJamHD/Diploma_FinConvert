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

  if (recentTopUps.length < 2) {
    tips.push(
      "Ціль поповнюється рідко. Рекомендується встановити регулярний графік."
    );
  }

  if (avgAmount < goal.amount * 0.05) {
    tips.push(
      `Середня сума поповнення (${avgAmount.toFixed(
        2
      )}) є досить низькою відносно цілі. Розгляньте можливість збільшити внески.`
    );
  }

  if (balances[goal.currency] && balances[goal.currency] >= goal.amount * 0.1) {
    tips.push("У вас є кошти в гаманці для часткового поповнення цієї цілі.");
  }

  return tips;
};

export default useAdviceTopUps;
