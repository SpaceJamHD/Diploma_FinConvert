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
      `Ви вже витратили ${totalSpent.toFixed(2)} ${
        goal.currency
      } з цієї цілі. Перевірте, чи це було заплановано.`
    );
  }

  if (avgSpending > goal.amount * 0.2) {
    advice.push(
      `Середня витрата складає ${avgSpending.toFixed(2)} ${
        goal.currency
      }, що є досить значною. Розгляньте можливість скорочення витрат.`
    );
  } else if (avgSpending < goal.amount * 0.05 && spendingTx.length > 0) {
    advice.push(
      `Ваші середні витрати (${avgSpending.toFixed(
        2
      )}) низькі — це допомагає досягти мети швидше.`
    );
  }

  if (recentSpending.length > 3) {
    advice.push(
      `За останній місяць було ${
        recentSpending.length
      } витрат на суму ${recentTotal.toFixed(2)} ${
        goal.currency
      }. Перевірте, чи можна уникнути частих витрат.`
    );
  }

  if (totalSpent > goal.balance) {
    advice.push(
      "Ваші витрати перевищують залишок цілі. Це може вплинути на досягнення мети."
    );
  }

  if (spendingTx.length >= 5 && totalSpent > 0) {
    advice.push(
      "Ціль має значну кількість витрат. Можливо, варто скоротити необов'язкові витрати або переглянути бюджет."
    );
  }

  const excessiveSpendingTx = spendingTx.filter(
    (tx) => tx.amount > goal.amount * 0.4
  );

  if (excessiveSpendingTx.length > 0) {
    advice.push(
      `Зареєстровані великі витрати (понад 40% від мети). Переконайтесь, що це дійсно виправдані витрати.`
    );
  }

  const goalCompletionRatio = goal.balance / goal.amount;
  if (goalCompletionRatio < 0.5 && totalSpent > goal.amount * 0.3) {
    advice.push(
      "Витрати вже значні, а прогрес по цілі низький. Пора зменшити витрати або активніше поповнювати ціль."
    );
  }

  return advice;
};

export default useAdviceSpending;
