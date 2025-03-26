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

  const recentCurrencyChanges = incomeTx.filter(
    (tx) =>
      tx.from_currency &&
      tx.from_currency !== goal.currency &&
      new Date(tx.date) > new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)
  );

  if (recentCurrencyChanges.length > 2) {
    advice.push(
      "Часті поповнення з конвертацією протягом останнього місяця. Це може впливати на ефективність накопичення."
    );
  }

  const totalSpreadLoss = incomeTx.reduce(
    (sum, tx) => sum + (tx.spread_loss || 0),
    0
  );

  if (totalSpreadLoss > goal.amount * 0.05) {
    advice.push(
      `Втрати на спреді вже склали ${totalSpreadLoss.toFixed(2)} ${
        goal.currency
      }. Використовуйте валюту цілі для поповнення.`
    );
  }

  if (mismatchCount > 0 && totalSpreadLoss === 0) {
    advice.push(
      "Для кращої точності та уникнення втрат рекомендується поповнювати в валюті цілі."
    );
  }

  return advice;
};

export default useAdviceCurrency;
