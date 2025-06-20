const generateGoalPriorityAdvice = (goals = []) => {
  const advice = new Map();

  if (!Array.isArray(goals) || goals.length === 0) return [];

  const parseNumber = (val) => parseFloat(val || 0);

  const lowPriorityGoals = goals.filter(
    (goal) => goal.priority === "Низький" && parseNumber(goal.balance) > 0
  );

  const mediumPriorityGoals = goals.filter(
    (goal) => goal.priority === "Середній" && parseNumber(goal.balance) > 0
  );

  const highPriorityGoals = goals.filter((goal) => goal.priority === "Високий");

  const highNotFunded = highPriorityGoals.filter(
    (goal) => parseNumber(goal.balance) === 0
  );

  const totalLowBalance = lowPriorityGoals.reduce(
    (sum, g) => sum + parseNumber(g.balance),
    0
  );

  const totalHighMissing = highNotFunded.reduce(
    (sum, g) => sum + (parseNumber(g.amount) - parseNumber(g.balance)),
    0
  );

  if (
    highPriorityGoals.length > 0 &&
    highNotFunded.length === highPriorityGoals.length
  ) {
    advice.set("high-priority-neglected", {
      id: "high-priority-neglected",
      text: "Жодна з ваших високопріоритетних цілей не фінансується — перегляньте розподіл коштів.",
      type: "alert",
      category: "goals",
    });

    return Array.from(advice.values());
  }

  if (
    mediumPriorityGoals.length > 0 &&
    highNotFunded.length > 0 &&
    totalLowBalance > 0
  ) {
    advice.set("priority-imbalance", {
      id: "priority-imbalance",
      text: "Фінансуються середні цілі, хоча високопріоритетні ще не мають достатнього фінансування — перегляньте пріоритети.",
      type: "warning",
      category: "goals",
    });
  }

  if (totalLowBalance > 0 && totalLowBalance > totalHighMissing * 1.2) {
    advice.set("low-priority-overfunding", {
      id: "low-priority-overfunding",
      text: `Занадто багато коштів (${totalLowBalance.toFixed(
        2
      )} грн) зосереджено на цілях з низьким пріоритетом — розгляньте перенаправлення на важливіші цілі.`,
      type: "warning",
      category: "goals",
    });
  }

  return Array.from(advice.values());
};

export default generateGoalPriorityAdvice;
