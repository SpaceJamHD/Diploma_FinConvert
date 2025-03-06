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
    const { name, description, amount, priority, deadline, currency } =
      req.body;
    const userId = req.user.id;

    const goalResult = await pool.query(
      "SELECT balance, currency FROM goals WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (!goalResult.rows.length) {
      return res.status(404).json({ message: "Цель не найдена" });
    }

    let currentBalance = parseFloat(goalResult.rows[0].balance);
    let currentCurrency = goalResult.rows[0].currency;
    let finalBalance = currentBalance;

    if (currency && currency !== currentCurrency) {
      const exchangeRate = await getExchangeRate(currentCurrency, currency);
      if (!exchangeRate) {
        return res
          .status(400)
          .json({ message: "Ошибка получения курса валют" });
      }
      finalBalance = parseFloat((currentBalance * exchangeRate).toFixed(6));
    }

    const result = await pool.query(
      "UPDATE goals SET name = $1, description = $2, amount = $3, balance = $4, priority = $5, deadline = $6, currency = $7 WHERE id = $8 AND user_id = $9 RETURNING *",
      [
        name,
        description,
        amount,
        finalBalance,
        priority,
        deadline,
        currency || currentCurrency,
        id,
        userId,
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Ошибка при обновлении цели:", error);
    res.status(500).json({ message: "Ошибка сервера" });
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
    let goalBalance = parseFloat(goal.balance);
    let goalAmount = parseFloat(goal.amount);

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

    let actualDeposit = finalAmount;
    let excessAmount = 0;

    if (goalBalance + finalAmount > goalAmount) {
      excessAmount = goalBalance + finalAmount - goalAmount;
      actualDeposit = finalAmount - excessAmount;
    }

    const updatedGoal = await pool.query(
      `UPDATE goals 
       SET balance = balance + $1, 
           completed_at = CASE WHEN balance + $1 >= amount THEN NOW() ELSE completed_at END
       WHERE id = $2 RETURNING balance, completed_at`,
      [actualDeposit, id]
    );

    console.log(
      ` Новый баланс цели: ${updatedGoal.rows[0].balance} ${goalCurrency}`
    );

    await pool.query(
      "INSERT INTO transactions (user_id, goal_id, amount, type, date, description) VALUES ($1, $2, $3, $4, NOW(), $5)",
      [userId, id, actualDeposit, "income", "Пополнение цели"]
    );

    if (excessAmount > 0) {
      console.log(
        ` Остаток ${excessAmount} ${goalCurrency} возвращается в ${fromCurrency}`
      );

      let refundAmount = excessAmount;
      if (fromCurrency !== goalCurrency) {
        const reverseExchangeRate = await getExchangeRate(
          goalCurrency,
          fromCurrency
        );
        if (!reverseExchangeRate) {
          return res
            .status(400)
            .json({ message: "Ошибка конвертации излишка" });
        }
        refundAmount = parseFloat(
          (excessAmount * reverseExchangeRate).toFixed(6)
        );
      }

      console.log(
        ` Конвертируем остаток ${excessAmount} ${goalCurrency} → ${refundAmount} ${fromCurrency}`
      );

      await updateBalance(userId, fromCurrency, refundAmount, "deposit");
    }

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

    if (withdrawAmount <= 0) {
      return res
        .status(400)
        .json({ message: "Сумма вывода должна быть больше 0" });
    }

    if (withdrawAmount > currentBalance) {
      return res.status(400).json({ message: "Недостаточно средств в цели" });
    }

    const newGoalBalance = currentBalance - withdrawAmount;

    await pool.query(
      "UPDATE goals SET balance = $1 WHERE id = $2 RETURNING balance",
      [newGoalBalance, id]
    );

    await updateBalance(userId, goalCurrency, withdrawAmount, "deposit");

    await pool.query(
      "INSERT INTO transactions (user_id, goal_id, amount, type, date, description) VALUES ($1, $2, $3, $4, NOW(), $5)",
      [userId, id, withdrawAmount, "withdraw", "Частичный возврат из цели"]
    );

    await broadcastBalanceUpdate(userId);

    res.json({
      message: "Деньги успешно возвращены",
      newGoalBalance,
    });
  } catch (error) {
    console.error("Ошибка возврата средств:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const updateBalance = async (userId, currency, amount, operation) => {
  try {
    console.log(
      `${operation.toUpperCase()} ${amount} ${currency} для пользователя ${userId}`
    );

    let column = currency === "BTC" ? "amount_btc" : "amount";

    const balanceResult = await pool.query(
      `SELECT ${column} FROM balances WHERE user_id = $1 AND currency = $2`,
      [userId, currency]
    );

    let newAmount;

    if (balanceResult.rows.length === 0) {
      if (operation === "withdraw") {
        console.error("Ошибка: Баланс не найден, невозможно списание");
        throw new Error("Недостаточно средств");
      }

      console.log(`Создаем новый кошелек для ${currency}`);
      await pool.query(
        `INSERT INTO balances (user_id, currency, ${column}, type) VALUES ($1, $2, $3, $4)`,
        [userId, currency, amount, currency === "BTC" ? "crypto" : "regular"]
      );

      return amount;
    }

    let currentAmount = parseFloat(balanceResult.rows[0][column]);

    if (operation === "withdraw") {
      if (currentAmount < amount) {
        console.error("Ошибка: Недостаточно средств для списания");
        throw new Error("Недостаточно средств");
      }
      newAmount = currentAmount - amount;

      // Обнуляем, если баланс стал отрицательным
      if (newAmount < 0) {
        newAmount = 0;
      }
    } else {
      newAmount = currentAmount + amount;
    }

    await pool.query(
      `UPDATE balances SET ${column} = $1 WHERE user_id = $2 AND currency = $3`,
      [newAmount, userId, currency]
    );

    console.log(`Обновленный баланс ${currency}: ${newAmount}`);

    return newAmount;
  } catch (error) {
    console.error("Ошибка обновления баланса:", error);
    throw error;
  }
};

const withdrawFullGoal = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    console.log(`📌 Вывод всех средств из цели ID: ${id}, User ID: ${userId}`);

    // 1️⃣ Проверяем, есть ли цель у пользователя
    const goalResult = await pool.query(
      "SELECT * FROM goals WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (!goalResult.rows.length) {
      return res.status(404).json({ message: "Цель не найдена" });
    }

    const goal = goalResult.rows[0];
    console.log("🎯 Найдена цель:", goal);

    const goalBalance = parseFloat(goal.balance);
    const goalCurrency = goal.currency;

    if (goalBalance === 0) {
      return res.status(400).json({ message: "Цель уже пустая!" });
    }

    // 2️⃣ Сохраняем цель в историю (убираем created_at)
    const historyInsert = await pool.query(
      `INSERT INTO goals_history (goal_id, user_id, name, description, amount, currency, deadline, priority, achieved_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING id`, // Убрали created_at
      [
        goal.id,
        userId,
        goal.name,
        goal.description,
        goal.amount,
        goal.currency,
        goal.deadline,
        goal.priority,
      ]
    );

    console.log("📜 Цель сохранена в истории:", historyInsert.rows[0]);

    // 3️⃣ Создаем транзакцию возврата денег
    await pool.query(
      `INSERT INTO transactions (user_id, goal_id, amount, type, date, description, from_currency, to_currency)
       VALUES ($1, $2, $3, 'withdraw', NOW(), 'Перевод с достигнутой цели', $4, $4)`,
      [userId, id, goalBalance, goalCurrency]
    );

    // 4️⃣ Добавляем деньги обратно в кошелек
    await pool.query(
      `UPDATE balances SET amount = amount + $1 WHERE user_id = $2 AND currency = $3`,
      [goalBalance, userId, goalCurrency]
    );

    console.log(
      `💰 Средства возвращены в кошелек: ${goalBalance} ${goalCurrency}`
    );

    // 5️⃣ Удаляем цель
    const deleteResult = await pool.query(
      "DELETE FROM goals WHERE id = $1 RETURNING id",
      [id]
    );

    if (deleteResult.rowCount === 0) {
      throw new Error("Ошибка удаления цели!");
    }

    console.log(`✅ Цель ID: ${id} удалена`);

    // 6️⃣ Обновляем баланс по WebSocket
    await broadcastBalanceUpdate(userId);

    // 7️⃣ Отправляем успешный ответ
    res.json({
      message: "Цель удалена и сохранена в истории",
      deletedGoalId: id,
    });
  } catch (error) {
    console.error("❌ Ошибка при выводе средств:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const getGoalsHistory = async (req, res) => {
  const userId = req.user.id;
  const { start, end } = req.query;

  try {
    let query = `
      SELECT * FROM goals_history 
      WHERE user_id = $1 
    `;
    let params = [userId];

    if (start && end) {
      query += ` AND achieved_at BETWEEN $2 AND $3`;
      params.push(start, end);
    }

    query += ` ORDER BY achieved_at DESC`;

    const result = await pool.query(query, params);

    console.log("Отправляем историю целей:", result.rows);

    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка при получении истории целей:", error);
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
  getGoalsHistory,
  getGoalById,
  withdrawFullGoal,
};
