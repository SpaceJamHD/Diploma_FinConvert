const pool = require("../models/userModel");
const { broadcastBalanceUpdate } = require("../webSocket");
const { getExchangeRate } = require("../utils/exchangeRates");

// Получение всех валютных транзакций пользователя
const getUserTransactions = async (req, res) => {
  const userId = req.user.id; // ID пользователя из токена

  try {
    const result = await pool.query(
      "SELECT * FROM currency_transactions WHERE user_id = $1 ORDER BY date DESC",
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка при получении валютных транзакций:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

// Получение всех транзакций для цели
const getTransactionsByGoalId = async (req, res) => {
  const { goalId } = req.params;
  const userId = req.user.id; // ID пользователя из токена

  try {
    const result = await pool.query(
      "SELECT * FROM transactions WHERE goal_id = $1 AND user_id = $2 ORDER BY date DESC",
      [goalId, userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка при получении транзакций:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const createTransaction = async (req, res) => {
  const { amount, fromCurrency, toCurrency, type } = req.body;
  const userId = req.user.id;

  try {
    // Проверяем баланс перед списанием
    const balanceResult = await pool.query(
      "SELECT amount FROM balances WHERE user_id = $1 AND currency = $2",
      [userId, fromCurrency]
    );

    if (!balanceResult.rows.length || balanceResult.rows[0].amount < amount) {
      return res.status(400).json({ message: "Недостаточно средств" });
    }

    let finalAmount = amount;

    // Конвертация, если валюты разные
    if (fromCurrency !== toCurrency) {
      const exchangeRate = await getExchangeRate(fromCurrency, toCurrency);
      if (!exchangeRate) {
        return res
          .status(400)
          .json({ message: "Ошибка получения курса валют" });
      }
      finalAmount = parseFloat((amount * exchangeRate).toFixed(6));
    }

    // 🔻 Списываем деньги у пользователя
    await pool.query(
      "UPDATE balances SET amount = amount - $1 WHERE user_id = $2 AND currency = $3",
      [amount, userId, fromCurrency]
    );

    // 🔺 Зачисляем деньги (Используем ON CONFLICT)
    await pool.query(
      "INSERT INTO balances (user_id, currency, amount) VALUES ($1, $2, $3) \n" +
        "ON CONFLICT (user_id, currency) DO UPDATE SET amount = balances.amount + EXCLUDED.amount",
      [userId, toCurrency, finalAmount]
    );

    // ✅ Записываем транзакцию в таблицу currency_transactions
    const newTransaction = await pool.query(
      "INSERT INTO currency_transactions (user_id, amount, from_currency, to_currency, type, date) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *",
      [userId, amount, fromCurrency, toCurrency, type]
    );

    // 📡 Обновляем баланс клиента через WebSocket
    await broadcastBalanceUpdate(userId);

    res.json(newTransaction.rows[0]);
  } catch (error) {
    console.error("Ошибка при создании транзакции:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

module.exports = {
  getUserTransactions,
  getTransactionsByGoalId,
  createTransaction,
};
