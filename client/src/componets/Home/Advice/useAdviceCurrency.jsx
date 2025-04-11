const useAdviceCurrency = (goal, transactions = []) => {
  const advice = [];
  if (!goal || !Array.isArray(transactions)) return advice;

  const incomeTx = transactions.filter((t) => t.type === "income");
  const mismatchedCurrencyTx = incomeTx.filter(
    (tx) => tx.from_currency && tx.from_currency !== goal.currency
  );
  const mismatchCount = mismatchedCurrencyTx.length;

  if (mismatchCount > 0) {
    advice.push(
      `Було ${mismatchCount} поповнень в іншій валюті. Конвертація може призвести до втрат.`
    );
  }

  const recentCurrencyChanges = mismatchedCurrencyTx.filter(
    (tx) => new Date(tx.date) > new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)
  );

  if (recentCurrencyChanges.length > 2) {
    advice.push(
      "Часті поповнення з конвертацією протягом останнього місяця. Це може впливати на ефективність накопичення."
    );
  }

  const totalSpreadLoss = mismatchedCurrencyTx.reduce(
    (sum, tx) => sum + (tx.spread_loss || 0),
    0
  );

  if (totalSpreadLoss > goal.amount * 0.1) {
    advice.push(
      `Сумарні втрати на спреді перевищують 10% цілі (${totalSpreadLoss.toFixed(
        2
      )} ${goal.currency}). Необхідно оптимізувати поповнення.`
    );
  } else if (totalSpreadLoss > goal.amount * 0.05) {
    advice.push(
      `Втрати на спреді вже склали ${totalSpreadLoss.toFixed(2)} ${
        goal.currency
      }. Використовуйте валюту цілі для поповнення.`
    );
  }

  if (mismatchCount > 0 && totalSpreadLoss === 0) {
    advice.push(
      "Для кращої точності та уникнення потенційних втрат рекомендується поповнювати в валюті цілі."
    );
  }

  const extremeTx = mismatchedCurrencyTx.filter(
    (tx) => tx.spread_loss && tx.spread_loss > goal.amount * 0.03
  );

  if (extremeTx.length > 0) {
    advice.push(
      `Виявлено ${extremeTx.length} поповнення з високими втратами через спред. Розгляньте можливість фіксованих конверсій або використання стабільних валют.`
    );
  }

  if (mismatchCount > 5) {
    advice.push(
      "Велика кількість валютних поповнень. Це може ускладнити облік і планування. Зосередьтесь на стабільній валюті."
    );
  }

  if (incomeTx.length > 0 && mismatchCount / incomeTx.length > 0.5) {
    advice.push(
      "Більше половини всіх поповнень — у валюті, відмінній від цілі. Це знижує ефективність."
    );
  }

  return advice;
};

export default useAdviceCurrency;
