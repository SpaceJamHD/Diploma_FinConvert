const useAdviceSpending = (goal, transactions = [], timeFrame = "year") => {
  if (!goal || !Array.isArray(transactions)) return [];

  const now = new Date();
  const periodStart = new Date(
    timeFrame === "year"
      ? now.setFullYear(now.getFullYear() - 1)
      : now.setMonth(now.getMonth() - 6)
  );

  const spendingTx = transactions.filter(
    (t) =>
      (t.type === "withdraw" || t.type === "expense") &&
      new Date(t.date) >= periodStart
  );

  const totalSpent = spendingTx.reduce((sum, tx) => sum + tx.amount, 0);
  const avgSpending =
    spendingTx.length > 0 ? totalSpent / spendingTx.length : 0;

  const recentSpending = spendingTx.filter(
    (tx) => new Date(tx.date) > new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)
  );
  const recentTotal = recentSpending.reduce((sum, tx) => sum + tx.amount, 0);

  const criticalAdvice = [];
  const neutralAdvice = [];

  if (totalSpent > goal.balance) {
    criticalAdvice.push(
      "Ваші витрати перевищили залишок цілі. Це може загрожувати досягненню мети."
    );
  }

  const goalCompletionRatio = goal.balance / goal.amount;
  if (goalCompletionRatio < 0.5 && totalSpent > goal.amount * 0.3) {
    criticalAdvice.push(
      "Витрати значні, а прогрес по цілі — низький. Пора активніше поповнювати або скорочувати витрати."
    );
  }

  const excessiveSpendingTx = spendingTx.filter(
    (tx) => tx.amount > goal.amount * 0.4
  );
  if (excessiveSpendingTx.length > 0) {
    criticalAdvice.push(
      `Виявлено витрати понад 40% від цілі. Переконайтесь у доцільності цих витрат.`
    );
  }

  if (totalSpent > 0) {
    neutralAdvice.push(
      `Ви витратили ${totalSpent.toFixed(2)} ${goal.currency} з цієї цілі.`
    );
  }

  if (avgSpending > goal.amount * 0.3) {
    neutralAdvice.push(
      `Середня витрата становить ${avgSpending.toFixed(2)} ${
        goal.currency
      } — це висока сума. Скоротіть необов'язкові витрати.`
    );
  } else if (avgSpending > goal.amount * 0.15) {
    neutralAdvice.push(
      `Витрати помірні, але можуть бути оптимізовані. Перегляньте останні транзакції.`
    );
  } else if (avgSpending < goal.amount * 0.05 && spendingTx.length > 0) {
    neutralAdvice.push(
      `Ваші середні витрати (${avgSpending.toFixed(2)} ${
        goal.currency
      }) досить низькі — це допомагає накопичити швидше.`
    );
  }

  if (recentSpending.length > 5) {
    neutralAdvice.push(
      `За останній місяць було ${
        recentSpending.length
      } витрат на суму ${recentTotal.toFixed(2)} ${
        goal.currency
      }. Спробуйте встановити ліміт.`
    );
  }

  if (spendingTx.length >= 5 && totalSpent > 0) {
    neutralAdvice.push(
      "Ціль має значну кількість витрат. Варто проаналізувати, чи всі вони необхідні."
    );
  }

  if (spendingTx.length === 0 && goal.balance > 0) {
    neutralAdvice.push(
      "Чудово! У вас ще не було витрат з цієї цілі. Продовжуйте контролювати бюджет."
    );
  }

  if (criticalAdvice.length > 0) return criticalAdvice;

  return neutralAdvice;
};

export default useAdviceSpending;
