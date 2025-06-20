const useAdviceCurrency = (
  goal,
  transactions = [],
  timeFrame = "half-year"
) => {
  const advice = [];
  if (!goal || !Array.isArray(transactions)) return advice;

  const now = new Date();
  const periodStart =
    timeFrame === "year"
      ? new Date(now.setFullYear(now.getFullYear() - 1))
      : new Date(now.setMonth(now.getMonth() - 6));

  const incomeTx = transactions
    .filter((t) => t.type === "income")
    .filter((t) => new Date(t.date) >= periodStart);

  const mismatchedCurrencyTx = incomeTx.filter(
    (tx) => tx.from_currency && tx.from_currency !== goal.currency
  );

  const mismatchCount = mismatchedCurrencyTx.length;

  if (mismatchCount > 0) {
    advice.push(
      `Було ${mismatchCount} поповнень в іншій валюті. Конвертація може спричиняти втрати.`
    );
  }

  const recentChanges = mismatchedCurrencyTx.filter(
    (tx) => new Date(tx.date) >= new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)
  );

  if (recentChanges.length > 2) {
    advice.push(
      "Часті валютні поповнення за останній місяць. Це може вплинути на стабільність накопичень."
    );
  }

  const totalSpreadLoss = mismatchedCurrencyTx.reduce(
    (sum, tx) => sum + (tx.spread_loss || 0),
    0
  );

  if (totalSpreadLoss > goal.amount * 0.1) {
    advice.push(
      `Втрати на спреді перевищують 10% цілі (${totalSpreadLoss.toFixed(2)} ${
        goal.currency
      }). Це значна втрата.`
    );
  } else if (totalSpreadLoss > goal.amount * 0.05) {
    advice.push(
      `Втрати на спреді вже склали ${totalSpreadLoss.toFixed(2)} ${
        goal.currency
      }. Поповнюйте в основній валюті цілі.`
    );
  }

  const extremeTx = mismatchedCurrencyTx.filter(
    (tx) => tx.spread_loss && tx.spread_loss > goal.amount * 0.03
  );

  if (extremeTx.length > 0) {
    advice.push(
      `Було ${extremeTx.length} великих втрат на спреді. Розгляньте фіксовані курси або стабільні валюти.`
    );
  }

  if (mismatchCount > 5) {
    advice.push(
      "Багато валютних поповнень. Це ускладнює планування. Краще зосередитись на одній валюті."
    );
  }

  if (
    incomeTx.length > 0 &&
    mismatchCount / incomeTx.length > 0.5 &&
    totalSpreadLoss > 0
  ) {
    advice.push(
      "Більше половини поповнень — з іншої валюти. Це знижує ефективність і призводить до втрат."
    );
  }

  return advice;
};

export default useAdviceCurrency;
