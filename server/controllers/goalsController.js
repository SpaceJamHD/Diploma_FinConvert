const pool = require("../models/userModel");
const {
  getExchangeRate,
  getCryptoToFiatRate,
} = require("../utils/exchangeRates");
const { broadcastBalanceUpdate } = require("../webSocket");

const getGoals = async (req, res) => {
  try {
    const userId = req.user.id;
    const results = await pool.query("SELECT * FROM goals WHERE user_id = $1", [
      userId,
    ]);
    res.json(results.rows);
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
  let { originalAmount, convertedAmount, fromCurrency, converted } = req.body;
  const userId = req.user.id;

  try {
    console.log(" Запрос пополнения:", {
      goalId: id,
      userId,
      originalAmount,
      convertedAmount,
      fromCurrency,
      converted,
    });

    const goalResult = await pool.query(
      "SELECT * FROM goals WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (!goalResult.rows.length) {
      return res.status(404).json({ message: "Цель не найдена" });
    }

    const goal = goalResult.rows[0];
    const goalCurrency = goal.currency;

    let originAmt = parseFloat(originalAmount);
    let finalAmount = parseFloat(convertedAmount);

    const balanceResult = await pool.query(
      `SELECT currency, amount, COALESCE(amount_btc, 0) AS amount_btc 
       FROM balances WHERE user_id = $1`,
      [userId]
    );

    const balances = {};
    balanceResult.rows.forEach(({ currency, amount, amount_btc }) => {
      balances[currency] =
        currency === "BTC" ? parseFloat(amount_btc) : parseFloat(amount);
    });

    console.log("Баланс пользователя перед списанием:", balances);

    if (!balances[fromCurrency] || balances[fromCurrency] < originAmt) {
      console.error(` Недостаточно средств в ${fromCurrency}`);
      return res
        .status(400)
        .json({ message: `Недостаточно средств в ${fromCurrency}` });
    }

    console.log(` Списываем ${originAmt} ${fromCurrency} с кошелька`);
    await updateBalance(userId, fromCurrency, originAmt, "withdraw");

    if (!converted && fromCurrency !== goalCurrency) {
      console.log(
        ` Конвертация: ${originAmt} ${fromCurrency} → ${goalCurrency}`
      );
      const exchangeRate = await getExchangeRate(fromCurrency, goalCurrency);
      if (!exchangeRate) {
        return res
          .status(400)
          .json({ message: "Ошибка получения курса валют" });
      }
      finalAmount = parseFloat((originAmt * exchangeRate).toFixed(6));
    }

    const updatedGoal = await pool.query(
      "UPDATE goals SET balance = balance + $1 WHERE id = $2 RETURNING balance",
      [finalAmount, id]
    );

    console.log(
      ` Новый баланс цели: ${updatedGoal.rows[0].balance} ${goalCurrency}`
    );

    await pool.query(
      "INSERT INTO transactions (user_id, goal_id, amount, type, date, description) VALUES ($1, $2, $3, $4, NOW(), $5)",
      [userId, id, finalAmount, "income", "Пополнение цели"]
    );

    await broadcastBalanceUpdate(userId);

    res.json({ updatedBalance: updatedGoal.rows[0].balance });
  } catch (error) {
    console.error(" Ошибка пополнения цели:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const withdrawFromGoal = async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;
  const userId = req.user.id;

  try {
    const goalResult = await pool.query(
      "SELECT * FROM goals WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (!goalResult.rows.length) {
      return res.status(404).json({ message: "Цель не найдена" });
    }

    const goal = goalResult.rows[0];
    const goalCurrency = goal.currency;
    const currentBalance = parseFloat(goal.balance);
    const withdrawAmount = parseFloat(amount);

    if (currentBalance < withdrawAmount) {
      return res.status(400).json({ message: "Недостаточно средств в цели" });
    }

    const newGoalBalance = currentBalance - withdrawAmount;
    await pool.query(
      "UPDATE goals SET balance = $1 WHERE id = $2 RETURNING balance",
      [newGoalBalance, id]
    );

    const balanceResult = await pool.query(
      "SELECT currency, amount FROM balances WHERE user_id = $1",
      [userId]
    );

    let balances = {};
    balanceResult.rows.forEach(({ currency, amount }) => {
      balances[currency] = parseFloat(amount);
    });

    let depositAmount = withdrawAmount;
    let walletCurrency = goalCurrency;

    if (!balances[goalCurrency]) {
      console.log("Валюта цели не найдена в кошельке, конвертируем в UAH");
      const exchangeRate = await getExchangeRate(goalCurrency, "UAH");
      if (!exchangeRate) {
        return res.status(400).json({ message: "Ошибка конвертации валюты" });
      }
      depositAmount = withdrawAmount * exchangeRate;
      walletCurrency = "UAH";
    }

    await updateBalance(userId, walletCurrency, depositAmount, "deposit");

    await broadcastBalanceUpdate(userId);

    await pool.query(
      "INSERT INTO transactions (user_id, goal_id, amount, type, date, description) VALUES ($1, $2, $3, $4, NOW(), $5)",
      [userId, id, withdrawAmount, "withdraw", "Возврат из цели"]
    );

    res.json({
      message: "Деньги успешно возвращены",
      newGoalBalance,
    });
  } catch (error) {
    console.error("❌ Ошибка возврата средств:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const updateBalance = async (userId, currency, amount, operation) => {
  try {
    console.log(
      ` ${operation.toUpperCase()} ${amount} ${currency} для пользователя ${userId}`
    );

    let column = currency === "BTC" ? "amount_btc" : "amount";

    const balanceResult = await pool.query(
      `SELECT ${column} FROM balances WHERE user_id = $1 AND currency = $2`,
      [userId, currency]
    );

    let newAmount;

    if (balanceResult.rows.length === 0) {
      if (operation === "withdraw") {
        console.error(" Ошибка: Баланс не найден, невозможно списание");
        throw new Error("Недостаточно средств");
      }

      console.log(` Создаем новый кошелек для ${currency}`);
      await pool.query(
        `INSERT INTO balances (user_id, currency, ${column}, type) VALUES ($1, $2, $3, $4)`,
        [userId, currency, amount, currency === "BTC" ? "crypto" : "regular"]
      );

      console.log(` Кошелек создан: ${amount} ${currency}`);
      return amount;
    }

    let currentAmount = parseFloat(balanceResult.rows[0][column]);

    if (operation === "withdraw") {
      newAmount = currentAmount - amount;
    } else {
      newAmount = currentAmount + amount;
    }

    if (newAmount < 0) {
      console.error(" Ошибка: Недостаточно средств после операции");
      throw new Error("Недостаточно средств");
    }

    await pool.query(
      `UPDATE balances SET ${column} = $1 WHERE user_id = $2 AND currency = $3`,
      [newAmount, userId, currency]
    );

    console.log(` Обновленный баланс ${currency}: ${newAmount}`);
    return newAmount;
  } catch (error) {
    console.error(" Ошибка обновления баланса:", error);
    throw error;
  }
};

const withdrawFullGoal = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const goalResult = await pool.query(
      "SELECT * FROM goals WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (!goalResult.rows.length) {
      return res.status(404).json({ message: "Цель не найдена" });
    }

    const goal = goalResult.rows[0];

    if (parseFloat(goal.balance) === 0) {
      return res
        .status(400)
        .json({ message: "На цели нет средств для вывода" });
    }

    const goalBalance = parseFloat(goal.balance);
    const goalCurrency = goal.currency;

    await pool.query(
      "UPDATE goals SET balance = 0 WHERE id = $1 RETURNING balance",
      [id]
    );

    await pool.query(
      `INSERT INTO transactions (user_id, goal_id, amount, type, date, description, from_currency, to_currency)
       VALUES ($1, $2, $3, 'withdraw', NOW(), 'Перевод с достигнутой цели', $4, $4)`,
      [userId, id, goalBalance, goalCurrency]
    );

    await pool.query(
      `UPDATE balances 
       SET amount = amount + $1
       WHERE user_id = $2 AND currency = $3`,
      [goalBalance, userId, goalCurrency]
    );

    await broadcastBalanceUpdate(userId);

    res.json({
      message: "Средства успешно переведены",
      newGoalBalance: 0,
    });
  } catch (error) {
    console.error(" Ошибка при выводе средств:", error);
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
  withdrawFromGoal,
  updateBalance,
  getGoalById,
  withdrawFullGoal,
};
