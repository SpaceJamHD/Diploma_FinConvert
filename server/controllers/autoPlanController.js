const pool = require("../models/userModel");
const { addBalanceToGoal } = require("./goalsController");
const { getExchangeRate } = require("../utils/exchangeRates");

const createAutoPlan = async (req, res) => {
  const userId = req.user.id;
  const { goal_id, amount, currency, frequency, start_date, end_date } =
    req.body;

  try {
    await pool.query(
      `INSERT INTO auto_goal_plans (
        user_id, goal_id, amount, currency, frequency, start_date, end_date, next_execution
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        userId,
        goal_id,
        amount,
        currency,
        frequency,
        start_date,
        end_date,
        start_date,
      ]
    );

    res.status(201).json({ message: "Автоплан створено успішно" });
  } catch (error) {
    console.error("❌ Помилка при створенні автоплану:", error);
    res.status(500).json({ message: "Помилка сервера" });
  }
};

const getUserAutoPlans = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `SELECT * FROM auto_goal_plans WHERE user_id = $1 ORDER BY next_execution ASC`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка загрузки автопланов:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const deleteAutoPlan = async (req, res) => {
  const planId = req.params.id;
  const userId = req.user.id;
  try {
    await pool.query(
      `DELETE FROM auto_goal_plans WHERE id = $1 AND user_id = $2`,
      [planId, userId]
    );
    res.status(204).send();
  } catch (error) {
    console.error("Ошибка удаления плана:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

// Функция запуска плана (можно вызвать вручную или cron)
const runAutoPlansNow = async (req, res) => {
  const userId = req.user.id;
  try {
    const { rows } = await pool.query(
      `SELECT * FROM auto_goal_plans WHERE user_id = $1 AND next_execution <= NOW()`,
      [userId]
    );

    const executed = [];

    for (let plan of rows) {
      try {
        let convertedAmount = plan.amount;
        let isConverted = false;

        if (plan.currency !== "UAH") {
          const exchangeRate = await getExchangeRate(plan.currency, "UAH");
          if (!exchangeRate) {
            console.error(
              `Ошибка получения курса валют для ${plan.currency} → UAH`
            );
            continue;
          }
          convertedAmount = parseFloat((plan.amount * exchangeRate).toFixed(6));
          isConverted = true;
        }

        await addBalanceToGoal(
          { params: { id: plan.goal_id }, user: { id: userId } },
          {
            body: {
              originalAmount: plan.amount,
              convertedAmount,
              fromCurrency: plan.currency,
              converted: isConverted,
            },
            status: () => ({ json: () => {} }),
            json: () => {},
          }
        );

        let nextDate = new Date(plan.next_execution);
        if (plan.frequency === "daily")
          nextDate.setDate(nextDate.getDate() + 1);
        else if (plan.frequency === "weekly")
          nextDate.setDate(nextDate.getDate() + 7);
        else if (plan.frequency === "monthly")
          nextDate.setMonth(nextDate.getMonth() + 1);

        await pool.query(
          `UPDATE auto_goal_plans SET next_execution = $1 WHERE id = $2`,
          [nextDate, plan.id]
        );

        executed.push(plan.id);
      } catch (e) {
        console.error(`❌ Ошибка при исполнении плана ID ${plan.id}:`, e);
      }
    }

    res.json({ executed });
  } catch (error) {
    console.error("Ошибка запуска планов:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

module.exports = {
  createAutoPlan,
  getUserAutoPlans,
  deleteAutoPlan,
  runAutoPlansNow,
};
