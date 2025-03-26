const useAdviceAutoTopUp = (goal, autoPlans = []) => {
  const advice = [];

  if (!goal || !goal.id || autoPlans.length === 0) {
    advice.push(
      "Для цієї цілі не налаштоване автопоповнення. Розгляньте можливість його увімкнення для стабільного прогресу."
    );
    return advice;
  }

  const goalPlans = autoPlans.filter((plan) => plan.goal_id === goal.id);

  if (goalPlans.length === 0) {
    advice.push(
      "Ця ціль не має активного авто-поповнення. Це може уповільнити досягнення."
    );
    return advice;
  }

  advice.push(
    "Автопоповнення активне. Переконайтесь, що графік відповідає вашим можливостям."
  );

  if (goalPlans.some((plan) => plan.frequency === "monthly")) {
    advice.push(
      "Місячне автопоповнення забезпечує стабільність. Перевірте, чи вистачить цього до дедлайну."
    );
  }

  if (goalPlans.some((plan) => plan.frequency === "weekly")) {
    advice.push(
      "Щотижневе поповнення – хороший вибір для плавного досягнення цілі."
    );
  }

  if (goalPlans.some((plan) => plan.frequency === "daily")) {
    advice.push(
      "Щоденне поповнення дозволяє підтримувати постійний прогрес. Це підходить для високих пріоритетів."
    );
  }

  if (goalPlans.some((plan) => plan.currency !== goal.currency)) {
    advice.push(
      "Поповнення в іншій валюті можливе, але зверніть увагу на курсові коливання."
    );
  }

  if (goalPlans.length > 1) {
    advice.push(
      "У вас кілька активних автопланів. Переконайтесь, що вони не конфліктують і доповнюють одне одного."
    );
  }

  if (goalPlans.some((plan) => new Date(plan.start_date) > new Date())) {
    advice.push("Деякі автоплани ще не активні. Перевірте дату старту.");
  }

  if (
    goalPlans.some(
      (plan) => plan.end_date && new Date(plan.end_date) < new Date()
    )
  ) {
    advice.push(
      "У вас є автоплани, які вже завершились. Розгляньте продовження або створення нового."
    );
  }

  if (goalPlans.some((plan) => parseFloat(plan.amount) < 1)) {
    advice.push(
      "Сума автопоповнення виглядає дуже малою. Це може бути неефективно для швидкого досягнення мети."
    );
  }

  advice.push(
    "Пам'ятайте: регулярність — ключ до фінансового успіху. Навіть малі суми мають значення."
  );

  return advice;
};

export default useAdviceAutoTopUp;
