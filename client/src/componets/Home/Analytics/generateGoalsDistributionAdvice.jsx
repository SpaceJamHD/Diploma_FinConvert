const generateGoalsDistributionAdvice = (data, total) => {
  if (!Array.isArray(data) || data.length === 0)
    return ["Немає даних для аналізу за обраний період."];

  const advice = new Set();

  const sorted = [...data].sort((a, b) => b.total_uah - a.total_uah);
  const topGoal = sorted[0];
  const dominantGoal = sorted.find((g) => g.total_uah / total > 0.5);

  if (topGoal) {
    advice.add(
      `Ціль '${topGoal.name}' отримала найбільше поповнень — чудовий фокус на пріоритеті!`
    );
  }

  if (dominantGoal) {
    advice.add(
      `Більше 50% всіх поповнень припадає на ціль '${dominantGoal.name}' — розгляньте, чи це не занадто високий пріоритет.`
    );
  }

  const goalsAbove30 = data.filter((g) => g.total_uah / total > 0.3);
  if (goalsAbove30.length === 1) {
    advice.add(
      `Майже всі поповнення йдуть на одну ціль — '${goalsAbove30[0].name}'. Можливо, варто розподілити кошти рівномірніше.`
    );
  }

  const btcGoal = data.find((g) =>
    g.contributions?.some(
      (c) => c.from_currency === "BTC" && parseFloat(c.original) > 0
    )
  );
  if (btcGoal) {
    advice.add(
      `Ціль '${btcGoal.name}' частково поповнювалась BTC — пам'ятайте про волатильність криптовалюти.`
    );
  }

  const isCurrencyDominated = (goal) => {
    if (!goal.contributions || goal.contributions.length <= 1) return null;
    const total = goal.contributions.reduce(
      (sum, c) => sum + parseFloat(c.original || 0),
      0
    );
    const dominant = goal.contributions.find(
      (c) => parseFloat(c.original || 0) / total > 0.85
    );
    return dominant ? dominant.from_currency : null;
  };

  data.forEach((goal) => {
    const currency = isCurrencyDominated(goal);
    if (currency) {
      advice.add(
        `Ціль '${goal.name}' фінансується майже повністю в ${currency} — врахуйте валютні ризики.`
      );
    }

    if (parseFloat(goal.total_uah || 0) < 100) {
      advice.add(
        `Ціль '${goal.name}' має дуже низький рівень поповнень. Можливо, вона втратила актуальність?`
      );
    }
  });

  return Array.from(advice)
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);
};

export default generateGoalsDistributionAdvice;
