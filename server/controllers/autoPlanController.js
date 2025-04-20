const pool = require("../models/userModel");
const { addBalanceToGoal } = require("./goalsController");
const { getExchangeRate } = require("../utils/exchangeRates");

const createAutoPlan = async (req, res) => {
  const userId = req.user.id;
  const {
    goal_id,
    amount,
    currency,
    frequency,
    start_date,
    end_date,
    execution_time,
  } = req.body;

  try {
    await pool.query(
      `INSERT INTO auto_goal_plans (
        user_id, goal_id, amount, currency, frequency, start_date, end_date, next_execution, execution_time
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        userId,
        goal_id,
        amount,
        currency,
        frequency,
        start_date,
        end_date,
        start_date,
        execution_time,
      ]
    );

    res.status(201).json({ message: "Автоплан створено успішно" });
  } catch (error) {
    console.error("Помилка при створенні автоплану:", error);
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

const runAutoPlansNow = async (req, res) => {
  const userId = req.user.id;
  try {
    const { rows } = await pool.query(
      `SELECT * FROM auto_goal_plans 
      WHERE user_id = $1 
        AND next_execution::date <= NOW()::date 
        AND (execution_time IS NULL OR execution_time <= TO_CHAR(NOW(), 'HH24:MI:SS')::time)`,
      [userId]
    );

    const executed = [];

    for (let plan of rows) {
      try {
        const originalAmount = parseFloat(plan.amount);

        if (originalAmount === 0) {
          console.log(` Пропущено: сума 0 (${plan.amount} ${plan.currency})`);
          continue;
        }

        let convertedAmount = originalAmount;
        let isConverted = false;

        let spreadLoss = 0;

        if (plan.currency !== "UAH") {
          const exchangeRate = await getExchangeRate(plan.currency, "UAH");
          if (!exchangeRate) continue;

          const spreadPercent =
            plan.currency === "BTC" || "UAH" === "BTC" ? 0.015 : 0.005;

          const adjustedRate = exchangeRate * (1 - spreadPercent);
          const expectedAmount = originalAmount * exchangeRate;
          const actualAmount = originalAmount * adjustedRate;

          convertedAmount = parseFloat(actualAmount.toFixed(6));
          spreadLoss = parseFloat((expectedAmount - actualAmount).toFixed(6));
          isConverted = true;

          console.log(`Спред втрати: ${spreadLoss} UAH`);
        }

        if (convertedAmount === 0) {
          console.log(
            `Пропущено: конвертована сума 0 (${plan.amount} ${plan.currency})`
          );
          continue;
        }

        const fakeReq = {
          params: { id: plan.goal_id },
          user: { id: userId },
          body: {
            originalAmount,
            convertedAmount,
            fromCurrency: plan.currency,
            converted: isConverted,
            spreadLoss,
          },
        };

        const fakeRes = {
          status: () => ({ json: () => {} }),
          json: () => {},
        };

        await addBalanceToGoal(fakeReq, fakeRes);

        const goalRes = await pool.query(
          "SELECT name FROM goals WHERE id = $1",
          [plan.goal_id]
        );
        const goalName = goalRes.rows[0]?.name || "невідома ціль";

        const formattedAmount =
          plan.currency === "BTC"
            ? originalAmount.toFixed(8)
            : originalAmount.toFixed(2);

        await pool.query(
          `INSERT INTO notifications (user_id, message, created_at, read)
           VALUES ($1, $2, NOW(), false)`,
          [
            userId,
            `Ціль "${goalName}" поповнено на ${formattedAmount} ${plan.currency}`,
          ]
        );

        await pool.query(
          `DELETE FROM notifications
           WHERE user_id = $1
             AND id NOT IN (
               SELECT id FROM notifications
               WHERE user_id = $1
               ORDER BY created_at DESC
               LIMIT 5
             )`,
          [userId]
        );

        let nextDate = new Date(plan.next_execution);
        if (plan.frequency === "daily")
          nextDate.setDate(nextDate.getDate() + 1);
        else if (plan.frequency === "weekly")
          nextDate.setDate(nextDate.getDate() + 7);
        else if (plan.frequency === "monthly")
          nextDate.setMonth(nextDate.getMonth() + 1);

        if (plan.execution_time) {
          const [hours, minutes, seconds] = plan.execution_time.split(":");
          nextDate.setHours(
            parseInt(hours),
            parseInt(minutes),
            parseInt(seconds || "0")
          );
        }

        await pool.query(
          `UPDATE auto_goal_plans SET next_execution = $1 WHERE id = $2`,
          [nextDate, plan.id]
        );

        executed.push(plan.id);
      } catch (e) {
        console.error(` Помилка при виконанні плану ID ${plan.id}:`, e);
      }
    }

    res.json({ executed });
  } catch (error) {
    console.error(" Помилка запуску автопланів:", error);
    res.status(500).json({ message: "Помилка сервера" });
  }
};

const updateAutoPlan = async (req, res) => {
  const userId = req.user.id;
  const planId = req.params.id;
  const {
    goal_id,
    amount,
    currency,
    frequency,
    start_date,
    end_date,
    execution_time,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE auto_goal_plans
       SET goal_id = $1,
           amount = $2,
           currency = $3,
           frequency = $4,
           start_date = $5,
           end_date = $6,
           execution_time = $7
       WHERE id = $8 AND user_id = $9`,
      [
        goal_id,
        amount,
        currency,
        frequency,
        start_date,
        end_date,
        execution_time,
        planId,
        userId,
      ]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Автоплан не знайдено або не належить вам" });
    }

    res.json({ message: "Автоплан оновлено успішно" });
  } catch (error) {
    console.error("Помилка при оновленні автоплану:", error);
    res.status(500).json({ message: "Помилка сервера" });
  }
};

module.exports = {
  createAutoPlan,
  getUserAutoPlans,
  deleteAutoPlan,
  runAutoPlansNow,
  updateAutoPlan,
};
