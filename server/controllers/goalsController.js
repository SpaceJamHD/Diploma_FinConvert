const pool = require("../models/userModel");
const {
  getExchangeRate,
  getCryptoToFiatRate,
} = require("../utils/exchangeRates");

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
  const { amount, fromCurrency } = req.body; // Сумма для пополнения и валюта, с которой списывать
  const userId = req.user.id;

  try {
    // ✅ Получаем цель
    const goal = await pool.query(
      "SELECT * FROM goals WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (!goal.rows.length) {
      return res.status(404).json({ message: "Цель не найдена" });
    }

    const goalCurrency = goal.rows[0].currency; // Валюта цели
    let finalAmount = parseFloat(amount); // Финальная сумма пополнения

    // ✅ Получаем баланс пользователя
    const balanceResult = await pool.query(
      "SELECT currency, amount FROM balances WHERE user_id = $1",
      [userId]
    );

    const balances = {};
    balanceResult.rows.forEach(({ currency, amount }) => {
      balances[currency] = parseFloat(amount);
    });

    // Если баланс пользователя в валюте цели — просто списываем
    if (fromCurrency === goalCurrency) {
      if (balances[fromCurrency] < finalAmount) {
        return res.status(400).json({ message: "Недостаточно средств" });
      }
      await updateBalance(userId, fromCurrency, finalAmount, "withdraw");
    } else {
      // 🔄 Если валюта пополнения отличается, конвертируем сумму
      const exchangeRate = await getExchangeRate(fromCurrency, goalCurrency);
      if (!exchangeRate || isNaN(exchangeRate) || exchangeRate <= 0) {
        return res
          .status(400)
          .json({ message: "Ошибка получения курса валют" });
      }

      finalAmount = parseFloat(amount) * exchangeRate;

      // Проверяем, есть ли у пользователя нужные деньги в выбранной валюте
      if (balances[fromCurrency] < amount) {
        return res.status(400).json({ message: "Недостаточно средств" });
      }

      // ✅ Списываем деньги в исходной валюте
      await updateBalance(userId, fromCurrency, amount, "withdraw");
    }

    // ✅ Обновляем баланс цели с правильной суммой
    const updatedGoal = await pool.query(
      "UPDATE goals SET balance = balance + $1 WHERE id = $2 RETURNING balance",
      [finalAmount, id]
    );

    // ✅ Записываем транзакцию
    await pool.query(
      "INSERT INTO transactions (user_id, goal_id, amount, type, date, description) VALUES ($1, $2, $3, $4, NOW(), $5)",
      [userId, id, finalAmount, "income", "Пополнение цели"]
    );

    res.json({ updatedBalance: updatedGoal.rows[0].balance });
  } catch (error) {
    console.error("Ошибка пополнения цели:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const withdrawFromGoal = async (req, res) => {
  const { id } = req.params; // ID цели
  const { amount } = req.body; // Сумма для снятия
  const userId = req.user.id;

  try {
    // Получаем цель
    const goal = await pool.query(
      "SELECT * FROM goals WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (!goal.rows.length) {
      return res.status(404).json({ message: "Цель не найдена" });
    }

    const currentBalance = parseFloat(goal.rows[0].balance);
    if (currentBalance < amount) {
      return res.status(400).json({ message: "Недостаточно средств в цели" });
    }

    const newBalance = currentBalance - amount;

    // ✅ Добавляем деньги в кошелек
    await updateBalance(userId, goal.rows[0].currency, amount, "deposit");

    // ❌ Обновляем баланс цели
    await pool.query(
      "UPDATE goals SET balance = $1 WHERE id = $2 RETURNING balance",
      [newBalance, id]
    );

    res.json({ message: "Деньги успешно сняты", newGoalBalance: newBalance });
  } catch (error) {
    console.error("❌ Ошибка снятия средств:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const updateBalance = async (userId, currency, amount, operation) => {
  try {
    const balance = await pool.query(
      "SELECT amount FROM balances WHERE user_id = $1 AND currency = $2",
      [userId, currency]
    );

    if (balance.rows.length === 0) {
      throw new Error("Баланс не найден");
    }

    let newAmount =
      operation === "withdraw"
        ? balance.rows[0].amount - amount // ✅ Уменьшаем баланс
        : balance.rows[0].amount + amount; // ✅ Увеличиваем баланс

    if (newAmount < 0) {
      throw new Error("Недостаточно средств на балансе");
    }

    await pool.query(
      "UPDATE balances SET amount = $1 WHERE user_id = $2 AND currency = $3",
      [newAmount, userId, currency]
    );
  } catch (error) {
    console.error("❌ Ошибка обновления баланса:", error);
    throw error;
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
  withdrawFromGoal,
  updateBalance,
  getGoalById,
};
