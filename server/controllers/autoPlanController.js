const pool = require("../models/userModel");
const moment = require("moment-timezone");
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
    const nextExecution = new Date(`${start_date}T${execution_time}`);

    const utcDate = new Date(nextExecution.toISOString());

    await pool.query(
      `INSERT INTO auto_goal_plans (
        user_id, goal_id, amount, currency, frequency,
        start_date, end_date, next_execution, execution_time
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        userId,
        goal_id,
        amount,
        currency,
        frequency,
        start_date,
        end_date,
        utcDate, // <--- Вставляешь именно локализованное время
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

const runAutoPlansNow = async (req = null, res = null) => {
  try {
    const { rows: plans } = await pool.query(`
      SELECT ap.*, up.timezone
      FROM auto_goal_plans ap
      JOIN user_profiles up ON ap.user_id = up.user_id
    `);

    const nowUTC = moment.utc();
    const executed = [];

    for (const plan of plans) {
      const tz = plan.timezone || "UTC";

      const nowLocal = moment.utc().tz(tz);
      const today = nowLocal.format("YYYY-MM-DD");
      const start = moment(plan.start_date).format("YYYY-MM-DD");
      const end = plan.end_date
        ? moment(plan.end_date).format("YYYY-MM-DD")
        : null;
      const timeNow = nowLocal.format("HH:mm");

      const planExecutionMoment = moment.tz(
        `${today}T${plan.execution_time}`,
        tz
      );
      const planTime = planExecutionMoment.format("HH:mm");

      console.log(`⏰ nowUTC: ${nowUTC.format()}`);
      console.log(`🌍 nowLocal (${tz}): ${nowLocal.format()}`);
      console.log(`🔁 plan.execution_time: ${plan.execution_time}`);
      console.log(`🎯 planTime: ${planTime}`);
      console.log(`📌 timeNow === planTime ?`, timeNow === planTime);

      console.log("Сравниваем:", {
        nowLocal: timeNow,
        planTime,
        execution_time: plan.execution_time,
        tz,
      });

      console.log("🕒 План:", {
        nowLocal: nowLocal.format(),
        timeNow,
        planExecutionTime: plan.execution_time,
        planTime,
        match: timeNow === planTime,
        today,
        start,
        end,
      });

      if (timeNow !== planTime) continue;

      if (today < start || (end && today > end)) continue;

      const fakeReq = {
        params: { id: plan.goal_id },
        user: { id: plan.user_id },
        body: {
          originalAmount: parseFloat(plan.amount),
          convertedAmount: 0,
          fromCurrency: plan.currency,
        },
      };

      const fakeRes = {
        status: () => ({ json: () => {} }),
        json: () => {},
      };

      try {
        await addBalanceToGoal(fakeReq, fakeRes);

        await pool.query(
          `INSERT INTO notifications (user_id, message, created_at, read)
           VALUES ($1, $2, NOW(), false)`,
          [
            plan.user_id,
            `Ціль оновлено автоматично на ${plan.amount} ${plan.currency}`,
          ]
        );

        let nextDate = nowLocal.clone();

        if (plan.frequency === "daily") nextDate.add(1, "day");
        else if (plan.frequency === "weekly") nextDate.add(1, "week");
        else if (plan.frequency === "monthly") nextDate.add(1, "month");

        const [h, m, s] = plan.execution_time.split(":");
        nextDate.set({ hour: +h, minute: +m, second: +(s || 0) });

        await pool.query(
          `UPDATE auto_goal_plans SET next_execution = $1 WHERE id = $2`,
          [nextDate.utc().toDate(), plan.id]
        );

        if (res) {
          return res.json({ executed });
        } else {
          console.log("✅ Завершено. Виконано автопланів:", executed.length);
        }

        executed.push(plan.id);
      } catch (error) {
        console.error("❌ Ошибка автоплана:", plan.id, error);
      }
    }

    console.log("✅ Завершено. Виконано автопланів:", executed.length);
  } catch (error) {
    console.error("Ошибка выполнения автопланов:", error);
    console.error("❌ Помилка при виконанні автопланів:", error);
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
