const useAdviceDeadline = (goal, transactions = []) => {
  const advice = [];

  if (!goal || !goal.deadline || !Array.isArray(transactions)) return advice;

  const now = new Date();
  const deadline = new Date(goal.deadline);
  const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

  const totalProgress = goal.balance || 0;
  const totalGoal = goal.amount || 1;
  const progressPercentage = (totalProgress / totalGoal) * 100;

  const incomeTx = transactions.filter((tx) => tx.type === "income");

  if (daysLeft <= 0 && totalProgress < totalGoal) {
    advice.push(
      "Дедлайн вже минув, а мета не досягнута. Розгляньте продовження терміну або збільшення пріоритету цієї цілі."
    );
  }

  if (progressPercentage >= 100) {
    advice.push(
      "Вітаємо! Ціль досягнута. Ви можете закрити її або перевести кошти в іншу ціль."
    );
    return advice;
  }

  if (incomeTx.length > 0) {
    const firstDate = new Date(incomeTx[incomeTx.length - 1].date);
    const daysPassed = Math.max(
      1,
      Math.ceil((now - firstDate) / (1000 * 60 * 60 * 24))
    );
    const totalAdded = incomeTx.reduce((sum, tx) => sum + tx.amount, 0);
    const avgPerDay = totalAdded / daysPassed;
    const neededPerDay = (totalGoal - totalProgress) / daysLeft;

    if (avgPerDay === 0 && totalProgress === 0) {
      advice.push(
        "Мета не має поповнень. Почніть з малого, навіть 1 внесок може змінити ситуацію."
      );
    }

    if (neededPerDay > avgPerDay * 1.5 && daysLeft < 30) {
      advice.push(
        `Залишилось менше місяця, а темп (${avgPerDay.toFixed(2)} ${
          goal.currency
        }/день) значно нижчий за необхідний (${neededPerDay.toFixed(2)} ${
          goal.currency
        }/день). Рекомендується терміново збільшити внески.`
      );
    } else if (neededPerDay > avgPerDay * 1.2) {
      advice.push(
        `Темп (${avgPerDay.toFixed(2)} ${
          goal.currency
        }/день) нижчий за потрібний (${neededPerDay.toFixed(2)} ${
          goal.currency
        }/день). Потрібно збільшити регулярність поповнень.`
      );
    } else if (
      avgPerDay >= neededPerDay &&
      daysLeft <= 10 &&
      progressPercentage < 90
    ) {
      advice.push(
        "Мета майже досягнута, але дедлайн близько. Останній ривок — і ви впораєтесь!"
      );
    } else if (avgPerDay >= neededPerDay) {
      advice.push(
        "Темп достатній для досягнення мети. Продовжуйте у тому ж дусі!"
      );
    }

    if (progressPercentage >= 80 && daysLeft > 10) {
      advice.push(
        "Ви попереду графіку. Можливо, варто завершити мету достроково або оптимізувати інші фінансові цілі."
      );
    }
  } else {
    advice.push(
      "У мети ще не було поповнень. Визначте бюджет і зробіть перший внесок."
    );
  }

  return advice;
};

export default useAdviceDeadline;
