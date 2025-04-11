const useAdviceSpending = (goal, transactions = []) => {
  const advice = [];

  if (!goal || !Array.isArray(transactions)) return advice;

  const spendingTx = transactions.filter((t) => t.type === "expense");
  const totalSpent = spendingTx.reduce((sum, tx) => sum + tx.amount, 0);
  const avgSpending =
    spendingTx.length > 0 ? totalSpent / spendingTx.length : 0;

  const recentSpending = spendingTx.filter(
    (tx) => new Date(tx.date) > new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)
  );
  const recentTotal = recentSpending.reduce((sum, tx) => sum + tx.amount, 0);

  if (totalSpent > 0) {
    advice.push(
      `Ви витратили ${totalSpent.toFixed(2)} ${
        goal.currency
      } з цієї цілі. Перевірте, чи це відповідає вашому фінансовому плану.`
    );
  }

  if (avgSpending > goal.amount * 0.3) {
    advice.push(
      `Середня витрата становить ${avgSpending.toFixed(2)} ${
        goal.currency
      } — це висока сума. Скоротіть необов'язкові витрати.`
    );
  } else if (avgSpending > goal.amount * 0.15) {
    advice.push(
      `Витрати помірні, але можуть бути оптимізовані. Перегляньте останні транзакції.`
    );
  } else if (avgSpending < goal.amount * 0.05 && spendingTx.length > 0) {
    advice.push(
      `Ваші середні витрати (${avgSpending.toFixed(2)} ${
        goal.currency
      }) досить низькі — це допомагає накопичити швидше.`
    );
  }

  if (recentSpending.length > 5) {
    advice.push(
      `За останній місяць було ${
        recentSpending.length
      } витрат на суму ${recentTotal.toFixed(2)} ${
        goal.currency
      }. Спробуйте встановити ліміт.`
    );
  }

  if (totalSpent > goal.balance) {
    advice.push(
      "Ваші витрати перевищили залишок цілі. Це може загрожувати досягненню мети."
    );
  }

  if (spendingTx.length >= 5 && totalSpent > 0) {
    advice.push(
      "Ціль має значну кількість витрат. Варто проаналізувати, чи всі вони необхідні."
    );
  }

  const excessiveSpendingTx = spendingTx.filter(
    (tx) => tx.amount > goal.amount * 0.4
  );
  if (excessiveSpendingTx.length > 0) {
    advice.push(
      `Виявлено витрати понад 40% від цілі. Переконайтесь у доцільності цих витрат.`
    );
  }

  const goalCompletionRatio = goal.balance / goal.amount;
  if (goalCompletionRatio < 0.5 && totalSpent > goal.amount * 0.3) {
    advice.push(
      "Витрати значні, а прогрес по цілі — низький. Пора активніше поповнювати або скорочувати витрати."
    );
  }

  if (spendingTx.length === 0 && goal.balance > 0) {
    advice.push(
      "Чудово! У вас ще не було витрат з цієї цілі. Продовжуйте контролювати бюджет."
    );
  }

  return advice;
};

export default useAdviceSpending;
