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
  const { id } = req.params;
  const { amount, fromCurrency } = req.body; // Получаем сумму и валюту пополнения
  const userId = req.user.id;

  try {
    // Получаем текущую цель
    const goalQuery = await pool.query(
      "SELECT * FROM goals WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (!goalQuery.rows.length) {
      return res.status(404).json({ message: "Цель не найдена" });
    }

    const currentGoal = goalQuery.rows[0];
    const goalCurrency = currentGoal.currency; // Валюта цели

    // Конвертация суммы, если валюты не совпадают
    let convertedAmount = parseFloat(amount);
    if (fromCurrency !== goalCurrency) {
      const exchangeRate = await getExchangeRate(fromCurrency, goalCurrency); // Получаем курс валют
      convertedAmount = convertedAmount * exchangeRate;
    }

    // Обновляем баланс цели
    const updatedBalance = parseFloat(currentGoal.balance) + convertedAmount;

    const result = await pool.query(
      "UPDATE goals SET balance = $1 WHERE id = $2 RETURNING balance",
      [updatedBalance, id]
    );

    res.json({ updatedBalance: result.rows[0].balance });
  } catch (error) {
    console.error("Ошибка при добавлении баланса:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

module.exports = {
  getGoals,
  addGoal,
  updateGoal,
  deleteGoal,
  addBalanceToGoal,
};
