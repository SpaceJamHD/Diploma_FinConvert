const pool = require("../models/userModel");

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

module.exports = { getTransactionsByGoalId };
