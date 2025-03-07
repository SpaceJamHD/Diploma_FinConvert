const pool = require("../models/userModel");
const { broadcastBalanceUpdate } = require("../webSocket");
const { getExchangeRate } = require("../utils/exchangeRates");

const getUserTransactions = async (req, res) => {
  const userId = req.user.id;

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

const getTransactionsByGoalId = async (req, res) => {
  const { goalId } = req.params;
  const userId = req.user.id;

  try {
    console.log(`🔍 Ищем транзакции по goal_id: ${goalId}`);

    let result = await pool.query(
      "SELECT * FROM transactions WHERE goal_id = $1 AND user_id = $2 ORDER BY date DESC",
      [goalId, userId]
    );

    if (result.rows.length === 0) {
      console.warn(`⚠ Транзакции не найдены. Проверяем goals_history...`);

      // 🔍 Ищем историческую цель
      const historyGoal = await pool.query(
        "SELECT id FROM goals_history WHERE goal_id = $1 AND user_id = $2",
        [goalId, userId]
      );

      if (historyGoal.rows.length > 0) {
        const historyGoalId = historyGoal.rows[0].id;
        console.log(`📜 Найден goal_history_id: ${historyGoalId}`);

        // ✅ Загружаем транзакции из `goals_history_transactions`
        result = await pool.query(
          "SELECT * FROM goals_history_transactions WHERE goal_history_id = $1 AND user_id = $2 ORDER BY date DESC",
          [historyGoalId, userId]
        );
      }
    }

    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка при получении транзакций:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const createTransaction = async (req, res) => {
  const { amount, fromCurrency, toCurrency, type } = req.body;
  const userId = req.user.id;

  console.log(" Получен запрос на транзакцию:", {
    userId,
    amount,
    fromCurrency,
    toCurrency,
    type,
  });

  try {
    if (!amount || !fromCurrency || !toCurrency) {
      return res.status(400).json({ message: "Некорректные данные" });
    }

    const balanceResult = await pool.query(
      `SELECT amount, COALESCE(amount_btc, 0) AS amount_btc FROM balances 
       WHERE user_id = $1 AND currency = $2`,
      [userId, fromCurrency]
    );

    let currentBalance =
      fromCurrency === "BTC"
        ? parseFloat(balanceResult.rows[0].amount_btc)
        : parseFloat(balanceResult.rows[0].amount);

    if (!balanceResult.rows.length || currentBalance < amount) {
      return res.status(400).json({ message: "Недостаточно средств" });
    }

    let finalAmount = amount;

    if (fromCurrency !== toCurrency) {
      const exchangeRate = await getExchangeRate(fromCurrency, toCurrency);

      console.log(` Курс ${fromCurrency} → ${toCurrency}:`, exchangeRate);

      if (!exchangeRate || isNaN(exchangeRate) || exchangeRate <= 0) {
        return res
          .status(400)
          .json({ message: "Ошибка получения курса валют" });
      }

      finalAmount = parseFloat((amount * exchangeRate).toFixed(8));
    }

    console.log(
      ` Итоговая сумма после конвертации: ${finalAmount} ${toCurrency}`
    );

    await pool.query(
      `UPDATE balances 
       SET amount = CASE WHEN $3 != 'BTC' THEN amount - $1 ELSE amount END, 
           amount_btc = CASE WHEN $3 = 'BTC' THEN amount_btc - $1 ELSE amount_btc END
       WHERE user_id = $2 AND currency = $3`,
      [amount, userId, fromCurrency]
    );

    await pool.query(
      `INSERT INTO balances (user_id, currency, amount, amount_btc) 
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, currency) 
       DO UPDATE SET 
          amount = CASE WHEN EXCLUDED.currency != 'BTC' THEN balances.amount + EXCLUDED.amount ELSE balances.amount END, 
          amount_btc = CASE WHEN EXCLUDED.currency = 'BTC' THEN COALESCE(balances.amount_btc, 0) + EXCLUDED.amount_btc ELSE balances.amount_btc END`,
      [userId, toCurrency, finalAmount, toCurrency === "BTC" ? finalAmount : 0]
    );

    const newTransaction = await pool.query(
      "INSERT INTO currency_transactions (user_id, amount, from_currency, to_currency, type, date) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *",
      [userId, amount, fromCurrency, toCurrency, type]
    );

    await broadcastBalanceUpdate(userId);

    res.json(newTransaction.rows[0]);
  } catch (error) {
    console.error(" Ошибка при создании транзакции:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

module.exports = {
  getUserTransactions,
  getTransactionsByGoalId,
  createTransaction,
};
