const useAdviceDeadline = (
  goal,
  transactions = [],
  timeFrame = "half-year"
) => {
  const advice = [];

  if (!goal || !goal.deadline || !Array.isArray(transactions)) return advice;

  const now = new Date();
  const deadline = new Date(goal.deadline);
  const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

  const totalProgress = goal.balance || 0;
  const totalGoal = goal.amount || 1;
  const progressPercentage = (totalProgress / totalGoal) * 100;

  const periodStart =
    timeFrame === "year"
      ? new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
      : new Date(now.setMonth(now.getMonth() - 6));

  const incomeTx = transactions
    .filter((tx) => tx.type === "income")
    .filter((tx) => new Date(tx.date) >= periodStart);

  if (daysLeft <= 0 && totalProgress < totalGoal) {
    advice.push(
      "Дедлайн вже минув, а мета не досягнута. Розгляньте продовження терміну або зміну пріоритетів."
    );
  }

  if (progressPercentage >= 100) {
    advice.push(
      "Вітаємо! Ціль досягнута. Можна її завершити або перенаправити кошти."
    );
    return advice;
  }

  if (incomeTx.length > 0) {
    const firstDate = new Date(incomeTx[incomeTx.length - 1].date);
    const daysPassed = Math.max(
      1,
      Math.ceil((Date.now() - firstDate) / (1000 * 60 * 60 * 24))
    );
    const totalAdded = incomeTx.reduce((sum, tx) => sum + tx.amount, 0);
    const avgPerDay = totalAdded / daysPassed;
    const neededPerDay = (totalGoal - totalProgress) / daysLeft;

    if (avgPerDay === 0 && totalProgress === 0) {
      advice.push("Мета не має поповнень. Почніть з невеликого внеску.");
    } else if (neededPerDay > avgPerDay * 1.5 && daysLeft < 30) {
      advice.push(
        `Залишилось менше місяця, а темп (${avgPerDay.toFixed(2)} ${
          goal.currency
        }/день) значно нижчий за необхідний (${neededPerDay.toFixed(2)} ${
          goal.currency
        }/день). Варто збільшити частоту внесків.`
      );
    } else if (neededPerDay > avgPerDay * 1.2) {
      advice.push(
        `Темп (${avgPerDay.toFixed(2)} ${
          goal.currency
        }/день) нижчий за потрібний (${neededPerDay.toFixed(2)} ${
          goal.currency
        }/день). Варто відкоригувати графік поповнень.`
      );
    } else if (avgPerDay >= neededPerDay) {
      advice.push(
        "Ваш темп достатній для досягнення мети. Продовжуйте так само!"
      );
    }

    if (
      progressPercentage >= 80 &&
      daysLeft > 10 &&
      avgPerDay >= neededPerDay
    ) {
      advice.push(
        "Ви попереду графіку. Можна зосередитися на інших цілях або завершити цю раніше."
      );
    }
  } else {
    advice.push(
      "За останні пів року не було жодного поповнення. Визначте бюджет і зробіть перший внесок."
    );
  }

  return advice;
};

export default useAdviceDeadline;
