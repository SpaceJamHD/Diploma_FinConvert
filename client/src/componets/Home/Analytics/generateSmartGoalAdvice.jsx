const generateSmartGoalAdvice = (goals = [], autoPlans = []) => {
  const advice = new Map();

  if (!Array.isArray(goals) || goals.length === 0) return [];

  const now = new Date();
  const highPriority = goals.filter((g) => g.priority === "Високий");
  const lowProgress = goals.filter(
    (g) =>
      parseFloat(g.balance || 0) < parseFloat(g.amount || 1) * 0.5 &&
      new Date(g.deadline) < new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  );

  const nearComplete = goals.filter(
    (g) =>
      parseFloat(g.balance || 0) >= parseFloat(g.amount || 1) * 0.9 &&
      parseFloat(g.balance || 0) < parseFloat(g.amount || 1)
  );

  const manySmallGoals = goals.filter((g) => parseFloat(g.balance || 0) < 100);

  const inactiveAutoPlans = autoPlans.filter(
    (p) =>
      !p.next_execution ||
      new Date(p.next_execution) >
        new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
  );

  if (lowProgress.length > 0) {
    advice.set("deadline-risk", {
      id: "deadline-risk",
      text: "Є цілі з високим пріоритетом, що не фінансуються до дедлайну — перевірте прогрес і адаптуйте бюджет.",
      type: "warning",
      category: "goals",
    });
  }

  if (nearComplete.length > 0) {
    advice.set("almost-complete", {
      id: "almost-complete",
      text: "Одна або кілька цілей майже досягнуті — час для фінального кроку!",
      type: "positive",
      category: "goals",
    });
  }

  if (manySmallGoals.length >= 5) {
    advice.set("many-small-goals", {
      id: "many-small-goals",
      text: "У вас багато невеликих цілей з низьким прогресом — можливо, варто об'єднати або переглянути їх.",
      type: "info",
      category: "goals",
    });
  }

  if (inactiveAutoPlans.length > 0) {
    advice.set("inactive-autoplans", {
      id: "inactive-autoplans",
      text: "Деякі автопоповнення не активні або давно не використовувалися — перевірте, чи вони актуальні.",
      type: "neutral",
      category: "automation",
    });
  }

  return Array.from(advice.values());
};

export default generateSmartGoalAdvice;
