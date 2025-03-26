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
  if (incomeTx.length > 0) {
    const firstDate = new Date(incomeTx[incomeTx.length - 1].date);
    const daysPassed = Math.max(
      1,
      Math.ceil((now - firstDate) / (1000 * 60 * 60 * 24))
    );
    const totalAdded = incomeTx.reduce((sum, tx) => sum + tx.amount, 0);
    const avgPerDay = totalAdded / daysPassed;

    const neededPerDay = (totalGoal - totalProgress) / daysLeft;

    if (daysLeft <= 0) {
      advice.push(
        "Дедлайн уже минув. Якщо мета ще актуальна — оновіть дедлайн або активізуйте поповнення."
      );
    } else if (neededPerDay > avgPerDay * 1.3) {
      advice.push(
        `Темп (${avgPerDay.toFixed(2)} ${
          goal.currency
        }/день) нижчий за потрібний (${neededPerDay.toFixed(2)} ${
          goal.currency
        }/день). Потрібно збільшити внески.`
      );
    } else if (progressPercentage >= 80 && daysLeft > 10) {
      advice.push(
        "Темп дозволяє завершити мету раніше. Можливо, варто достроково її закрити або оптимізувати витрати."
      );
    } else if (avgPerDay >= neededPerDay) {
      advice.push(
        "Ви на правильному шляху до досягнення цілі до дедлайну. Продовжуйте в тому ж темпі!"
      );
    }
  }

  return advice;
};

export default useAdviceDeadline;
