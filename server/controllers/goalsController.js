const pool = require("../models/userModel");
const { getExchangeRate } = require("../utils/exchangeRates");

const getGoals = async (req, res) => {
  try {
    const userId = req.user.id; // Получаем ID пользователя из токена
    const results = await pool.query("SELECT * FROM goals WHERE user_id = $1", [
      userId,
    ]);
    res.json(results.rows); // Отправляем данные клиенту
  } catch (error) {
    console.error("Ошибка при загрузке целей:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const addGoal = async (req, res) => {
  const { name, amount, description, deadline, priority, currency } = req.body;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      "INSERT INTO goals (user_id, name, description, amount, balance, deadline, priority, currency) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [userId, name, description, amount, 0, deadline, priority, currency]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Ошибка при добавлении цели:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, amount, balance, priority, deadline, currency } =
      req.body;
    const result = await pool.query(
      "UPDATE goals SET name = $1, description = $2, amount = $3, balance = $4, priority = $5, deadline = $6, currency = $7 WHERE id = $8 RETURNING *",
      [name, description, amount, balance, priority, deadline, currency, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

const deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM goals WHERE id = $1", [id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

const addBalanceToGoal = async (req, res) => {
  const { id } = req.params; // ID цели
  const { amount } = req.body; // Сумма для добавления
  const userId = req.user.id; // ID пользователя из токена

  console.log("Параметры запроса:", { id, amount, userId });

  try {
    // Получаем цель из базы данных
    const goal = await pool.query(
      "SELECT * FROM goals WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (!goal.rows.length) {
      console.error("Цель не найдена");
      return res.status(404).json({ message: "Цель не найдена" });
    }

    const currentBalance = parseFloat(goal.rows[0].balance);
    const newBalance = currentBalance + parseFloat(amount);

    console.log("Обновленный баланс:", newBalance);

    // Обновляем баланс цели
    const updatedGoal = await pool.query(
      "UPDATE goals SET balance = $1 WHERE id = $2 RETURNING balance",
      [newBalance, id]
    );

    // Добавляем запись в таблицу транзакций
    await pool.query(
      "INSERT INTO transactions (user_id, goal_id, amount, type, date, description) VALUES ($1, $2, $3, $4, NOW(), $5)",
      [userId, id, amount, "income", "Пополнение баланса"]
    );

    res.json({ updatedBalance: updatedGoal.rows[0].balance });
  } catch (error) {
    console.error("Ошибка на сервере:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const getGoalById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      "SELECT * FROM goals WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Цель не найдена" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Ошибка при получении цели:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

module.exports = {
  getGoals,
  addGoal,
  updateGoal,
  deleteGoal,
  addBalanceToGoal,
  getGoalById,
};
