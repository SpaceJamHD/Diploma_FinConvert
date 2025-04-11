const generateFinalAdvice = (forecastData = {}) => {
  const advice = new Map();

  const {
    income = 0,
    expenses = 0,
    balance = 0,
    expectedBalance = 0,
    balanceChangePercent = 0,
    conversionsCount = 0,
    goalsCount = 0,
    transactionsCount = 0,
    lastActivityDaysAgo = null,
  } = forecastData;

  const percent = parseFloat(balanceChangePercent);
  const surplus = income - expenses;
  const incomeToExpenseRatio = income > 0 ? expenses / income : 0;
  const percentOfBalance = balance > 0 ? (expenses / balance) * 100 : 0;
  const percentOfIncome = income > 0 ? (expenses / income) * 100 : 0;

  if (!isNaN(percent) && percent < -5) {
    advice.set("balance-drop-5", {
      id: "balance-drop-5",
      text: `Баланс може зменшитися на ${Math.abs(percent).toFixed(
        1
      )}% — зверніть увагу.`,
      type: "warning",
      category: "forecast",
    });
  }

  if (!isNaN(percent) && percent < -40) {
    advice.set("balance-drop-40", {
      id: "balance-drop-40",
      text: "Різке падіння балансу понад 40% — можливо, витрати або шахрайство.",
      type: "critical",
      category: "anomaly",
    });
  }

  if (!isNaN(percent) && percent > 40) {
    advice.set("balance-up-40", {
      id: "balance-up-40",
      text: "Баланс зріс понад 40% — переконайтесь, що джерело доходу стабільне.",
      type: "info",
      category: "anomaly",
    });
  }

  if (surplus > 0) {
    advice.set("surplus-positive", {
      id: "surplus-positive",
      text: `Є профіцит ${surplus.toFixed(
        2
      )} грн — можна відкласти або інвестувати.`,
      type: "positive",
      category: "budget",
    });
  }

  if (income > 0 && expenses > 0 && income / expenses > 3) {
    advice.set("income-dominates", {
      id: "income-dominates",
      text: "Доходи значно перевищують витрати — час подумати про інвестиції.",
      type: "info",
      category: "income",
    });
  }

  if (
    (income > 0 && expenses / income > 1.2) ||
    (expenses > income && expenses > balance * 0.4)
  ) {
    advice.set("spending-too-high", {
      id: "spending-too-high",
      text: "Витрати значно перевищують дохід або становлять велику частину балансу — перегляньте бюджет.",
      type: "warning",
      category: "expenses",
    });
  }

  if (expenses === 0) {
    advice.set("no-expenses", {
      id: "no-expenses",
      text: "Немає витрат — перевірте дані або насолоджуйтесь економією.",
      type: "info",
      category: "expenses",
    });
  }

  if (expenses > 0 && expenses < 500) {
    advice.set("very-low-spending", {
      id: "very-low-spending",
      text: "Ваші витрати дуже низькі — якщо це свідомо, це чудово.",
      type: "neutral",
      category: "spending",
    });
  }

  if (percentOfBalance > 70) {
    advice.set("spending-over-70-percent", {
      id: "spending-over-70-percent",
      text: "Ви витратили понад 70% балансу — це ризиковано у разі несподіваних витрат.",
      type: "critical",
      category: "spending",
    });
  }

  if (income === 0) {
    advice.set("no-income", {
      id: "no-income",
      text: "Немає доходу за місяць — перевірте або додайте поповнення.",
      type: "alert",
      category: "income",
    });
  }

  if (income >= 3000) {
    advice.set("income-ok", {
      id: "income-ok",
      text: "Ваш дохід стабільний. Добре, якщо частину ви інвестуєте або відкладаєте.",
      type: "positive",
      category: "income",
    });
  }

  if (income === 0 && expenses === 0) {
    advice.set("no-activity", {
      id: "no-activity",
      text: "Жодної фінансової активності не виявлено — оновіть дані або додайте транзакції.",
      type: "neutral",
      category: "activity",
    });
  }

  if (lastActivityDaysAgo !== null && lastActivityDaysAgo > 14) {
    advice.set("inactive-too-long", {
      id: "inactive-too-long",
      text: `Остання активність була понад ${lastActivityDaysAgo} днів тому — перевірте актуальність даних.`,
      type: "info",
      category: "activity",
    });
  }

  if (goalsCount === 0) {
    advice.set("no-goals", {
      id: "no-goals",
      text: "У вас немає фінансових цілей — рекомендуємо створити хоча б одну.",
      type: "info",
      category: "goals",
    });
  }

  if (conversionsCount === 0) {
    advice.set("no-conversions", {
      id: "no-conversions",
      text: "Ви ще не проводили конвертацій валют — спробуйте це зробити для зручності.",
      type: "info",
      category: "conversion",
    });
  }

  if (conversionsCount >= 5) {
    advice.set("many-conversions", {
      id: "many-conversions",
      text: "У вас було понад 5 конвертацій — перевірте ефективність і врахуйте втрати на спреді.",
      type: "warning",
      category: "conversion",
    });
  }

  return Array.from(advice.values());
};

export default generateFinalAdvice;
