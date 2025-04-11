import { format } from "date-fns";

const autoTopUpAdviceTemplates = [
  {
    id: "no_auto_plan_configured",
    condition: (goal, autoPlans) => !goal || !goal.id || autoPlans.length === 0,
    message:
      "Для цієї цілі не налаштоване автопоповнення. Розгляньте можливість його увімкнення для стабільного прогресу.",
  },
  {
    id: "no_active_plan_for_goal",
    condition: (goal, autoPlans) =>
      autoPlans.filter((p) => p.goal_id === goal.id).length === 0,
    message:
      "Ця ціль не має активного авто-поповнення. Це може уповільнити досягнення.",
  },
  {
    id: "auto_top_up_active",
    condition: (goal, autoPlans) =>
      autoPlans.filter((p) => p.goal_id === goal.id).length > 0,
    message:
      "Автопоповнення активне. Переконайтесь, що графік відповідає вашим можливостям.",
  },
  {
    id: "frequency_tips",
    condition: (goal, autoPlans) => {
      const goalPlans = autoPlans.filter((p) => p.goal_id === goal.id);
      return goalPlans.some((p) =>
        ["daily", "weekly", "monthly"].includes(p.frequency)
      );
    },
    message: (goal, autoPlans) => {
      const frequencies = autoPlans
        .filter((p) => p.goal_id === goal.id)
        .map((p) => p.frequency);
      const freqSet = new Set(frequencies);
      if (freqSet.has("daily"))
        return "Щоденне поповнення дозволяє підтримувати постійний прогрес. Це підходить для високих пріоритетів.";
      if (freqSet.has("weekly"))
        return "Щотижневе поповнення – хороший вибір для плавного досягнення цілі.";
      if (freqSet.has("monthly"))
        return "Місячне автопоповнення забезпечує стабільність. Перевірте, чи вистачить цього до дедлайну.";
    },
  },
  {
    id: "currency_mismatch",
    condition: (goal, autoPlans) =>
      autoPlans.some(
        (p) => p.goal_id === goal.id && p.currency !== goal.currency
      ),
    message:
      "Поповнення в іншій валюті можливе, але зверніть увагу на курсові коливання та потенційні втрати.",
  },
  {
    id: "multiple_plans",
    condition: (goal, autoPlans) =>
      autoPlans.filter((p) => p.goal_id === goal.id).length > 1,
    message:
      "У вас кілька активних автопланів. Переконайтесь, що вони не конфліктують і доповнюють одне одного.",
  },
  {
    id: "not_yet_active",
    condition: (goal, autoPlans) =>
      autoPlans.some(
        (p) => p.goal_id === goal.id && new Date(p.start_date) > new Date()
      ),
    message:
      "Деякі автоплани ще не активні. Прогрес буде відкладений. Перевірте дату старту.",
  },
  {
    id: "already_ended",
    condition: (goal, autoPlans) =>
      autoPlans.some(
        (p) =>
          p.goal_id === goal.id &&
          p.end_date &&
          new Date(p.end_date) < new Date()
      ),
    message:
      "У вас є автоплани, які вже завершились. Розгляньте продовження або створення нового.",
  },
  {
    id: "too_small_amount",
    condition: (goal, autoPlans) =>
      autoPlans.some((p) => p.goal_id === goal.id && parseFloat(p.amount) < 1),
    message:
      "Сума автопоповнення виглядає дуже малою. Це може бути неефективно для швидкого досягнення мети.",
  },
  {
    id: "insufficient_total_plan",
    condition: (goal, autoPlans) => {
      const plans = autoPlans.filter((p) => p.goal_id === goal.id);
      const total = plans.reduce(
        (acc, p) => acc + parseFloat(p.amount || 0),
        0
      );
      return total < goal.amount * 0.3;
    },
    message:
      "Загальна сума автопланів суттєво менша за ціль. Розгляньте можливість збільшити внески.",
  },
  {
    id: "deadline_pressure",
    condition: (goal, autoPlans) => {
      const deadline = new Date(goal.deadline);
      const daysLeft = Math.ceil((deadline - new Date()) / (1000 * 3600 * 24));
      return daysLeft < 30;
    },
    message:
      "Досягнення цілі під загрозою: до дедлайну залишилось менше 30 днів. Перевірте темп поповнення.",
  },
  {
    id: "motivation",
    condition: () => true,
    message:
      "Пам'ятайте: регулярність — ключ до фінансового успіху. Навіть малі суми мають значення.",
  },
];

const useAdviceAutoTopUp = (goal, autoPlans = []) => {
  const advice = [];

  for (const template of autoTopUpAdviceTemplates) {
    const isValid = template.condition(goal, autoPlans);
    if (isValid) {
      const message =
        typeof template.message === "function"
          ? template.message(goal, autoPlans)
          : template.message;
      advice.push(message);
    }
  }

  return advice;
};

export default useAdviceAutoTopUp;
