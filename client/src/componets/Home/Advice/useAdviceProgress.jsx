const useAdviceProgress = (goal, transactions) => {
  const tips = [];

  if (!goal || !goal.amount || goal.amount === 0) return tips;

  const progress = (goal.balance / goal.amount) * 100;
  const completed = goal.completed_at !== null;

  if (completed) {
    tips.push(
      "Ціль досягнута! Розгляньте можливість створити нову ціль або перенаправити кошти."
    );
    return tips;
  }

  if (progress >= 100) {
    tips.push("Прогрес перевищує 100%. Ви перевиконали ціль — чудова робота!");
  } else if (progress >= 90) {
    tips.push(
      "Ви майже досягли цілі. Залишилось зовсім трішки — фінішна пряма!"
    );
  } else if (progress >= 60) {
    tips.push(
      "Вже подолано більше половини шляху. Можливо, настав час збільшити темп поповнень."
    );
  } else if (progress >= 30) {
    tips.push(
      "Прогрес помірний. Для прискорення досягнення цілі перегляньте частоту або обсяг внесків."
    );
  } else if (progress >= 10) {
    tips.push(
      "Початок покладено, але темп ще слабкий. Спробуйте встановити регулярне поповнення."
    );
  } else {
    tips.push(
      "Ціль майже не фінансується. Рекомендується встановити авто-поповнення або змінити пріоритет."
    );
  }

  const incomeTx = transactions.filter((t) => t.type === "income");
  const lastTopUp = incomeTx.sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  )[0];

  if (lastTopUp) {
    const daysSinceLast = Math.floor(
      (Date.now() - new Date(lastTopUp.date)) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLast >= 30) {
      tips.push(
        "Поповнення не було понад місяць. Це може сповільнити прогрес цілі."
      );
    } else if (daysSinceLast > 14) {
      tips.push(
        "Останнє поповнення було понад 2 тижні тому. Спробуйте відновити регулярність."
      );
    } else if (daysSinceLast <= 7 && progress < 100) {
      tips.push(
        "Ви нещодавно поповнювали ціль. Продовжуйте в тому ж дусі для стабільного прогресу!"
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
