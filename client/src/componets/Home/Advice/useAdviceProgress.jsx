const useAdviceProgress = (goal, transactions) => {
  const tips = [];

  if (!goal || !goal.amount || goal.amount === 0) return tips;

  const progress = (goal.balance / goal.amount) * 100;
  const completed = goal.completed_at !== null;

  if (completed) {
    tips.push(
      "Ціль досягнута! Розгляньте можливість створити нову ціль або повторити цю."
    );
    return tips;
  }

  if (progress >= 90) {
    tips.push(
      "Ви майже досягли цілі. Поповніть залишок і зафіксуйте досягнення."
    );
  } else if (progress >= 60) {
    tips.push(
      "Ви вже пройшли більше половини шляху. Можливо, варто пришвидшити поповнення."
    );
  } else if (progress >= 30) {
    tips.push(
      "Прогрес помірний. Перегляньте частоту поповнень або збільште суми."
    );
  } else if (progress < 10) {
    tips.push(
      "Ціль майже не фінансується. Рекомендується встановити авто-поповнення або змінити пріоритет."
    );
  }

  const lastTopUp = transactions
    .filter((t) => t.type === "income")
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

  if (lastTopUp) {
    const daysSinceLast = Math.floor(
      (Date.now() - new Date(lastTopUp.date)) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceLast > 14) {
      tips.push(
        "Останнє поповнення було понад 2 тижні тому. Спробуйте відновити регулярність."
      );
    }
  } else {
    tips.push(
      "Ціль ще не має жодного поповнення. Почніть шлях до досягнення цілі вже зараз."
    );
  }

  return tips;
};

export default useAdviceProgress;
