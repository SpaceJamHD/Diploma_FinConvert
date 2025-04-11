const generateGoalPriorityAdvice = (goals = []) => {
  const advice = new Map();

  if (!Array.isArray(goals) || goals.length === 0) return [];

  const lowPriorityGoals = goals.filter(
    (goal) => goal.priority === "Низький" && goal.balance > 0
  );

  const mediumPriorityGoals = goals.filter(
    (goal) => goal.priority === "Середній" && goal.balance > 0
  );

  const highPriorityGoals = goals.filter((goal) => goal.priority === "Високий");

  const highNotFunded = highPriorityGoals.filter(
    (goal) => parseFloat(goal.balance || 0) < parseFloat(goal.amount || 0) * 0.3
  );

  const totalLowBalance = lowPriorityGoals.reduce(
    (sum, g) => sum + parseFloat(g.balance || 0),
    0
  );

  const totalHighMissing = highNotFunded.reduce(
    (sum, g) => sum + (parseFloat(g.amount || 0) - parseFloat(g.balance || 0)),
    0
  );

  // 💡 Теперь уже безопасно использовать:
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
  }

  return Array.from(advice.values());
};

export default generateGoalPriorityAdvice;
