const useAdviceProgress = (
  goal,
  transactions = [],
  timeFrame = "half-year"
) => {
  const tips = [];
  if (!goal || !goal.amount || goal.amount === 0) return tips;

  const progress = (goal.balance / goal.amount) * 100;
  const completed = goal.completed_at !== null;

  if (completed || progress >= 100) {
    return [
      "Ціль досягнута! Ви перевиконали план — чудова робота. Можна створити нову ціль або перенаправити кошти.",
    ];
  }

  const now = new Date();
  const periodStart =
    timeFrame === "year"
      ? new Date(now.setFullYear(now.getFullYear() - 1))
      : new Date(now.setMonth(now.getMonth() - 6));

  const incomeTx = transactions.filter(
    (t) => t.type === "income" && new Date(t.date) >= periodStart
  );

  if (progress >= 90) {
    tips.push("Ви майже досягли цілі. Залишилось зовсім трішки!");
  } else if (progress >= 60) {
    tips.push(
      "Вже подолано більше половини шляху. Збільшення темпу може прискорити досягнення."
    );
  } else if (progress >= 30) {
    tips.push(
      "Прогрес помірний. Рекомендується переглянути частоту або обсяг внесків."
    );
  } else if (progress >= 10) {
    tips.push(
      "Початок є, але темп ще низький. Встановіть регулярне поповнення."
    );
  } else {
    tips.push(
      "Ціль майже не фінансується. Рекомендується увімкнути авто-поповнення або змінити пріоритет."
    );
  }

  if (incomeTx.length > 0) {
    const lastTopUp = incomeTx.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    )[0];

    const daysSinceLast = Math.floor(
      (Date.now() - new Date(lastTopUp.date)) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLast >= 30) {
      tips.push("Поповнення не було понад місяць. Це сповільнює прогрес.");
    } else if (daysSinceLast > 14) {
      tips.push("Останнє поповнення було понад 2 тижні тому.");
    } else if (daysSinceLast <= 7 && progress < 100) {
      tips.push("Нещодавно було поповнення. Продовжуйте в тому ж дусі!");
    }
  } else {
    tips.push("За пів року не було жодного поповнення. Почніть діяти.");
  }

  return tips;
};

export default useAdviceProgress;
