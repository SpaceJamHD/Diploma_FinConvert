const express = require("express");
const router = express.Router();
const pool = require("../models/userModel");
const {
  getGoals,
  addGoal,
  updateGoal,
  deleteGoal,
  addBalanceToGoal,
  withdrawFromGoal,
  withdrawFullGoal,
  getGoalsHistory,
  getGoalById,
} = require("../controllers/goalsController");
const authenticateToken = require("../middleware/authenticateToken");

router.get("/", authenticateToken, getGoals);
router.get("/history", authenticateToken, getGoalsHistory);
router.get("/history/:goalId", authenticateToken, async (req, res) => {
  const { goalId } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      "SELECT * FROM goals_history WHERE goal_id = $1 AND user_id = $2",
      [goalId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Цель не найдена в истории." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Ошибка при получении цели из истории:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.get(
  "/history/:goalId/transactions",
  authenticateToken,
  async (req, res) => {
    const { goalId } = req.params;
    const userId = req.user.id;

    try {
      console.log(
        `🔍 Запрашиваем транзакции для goalId: ${goalId}, userId: ${userId}`
      );

      // ✅ 1️⃣ Находим goal_history_id
      const historyGoal = await pool.query(
        "SELECT id FROM goals_history WHERE goal_id = $1 AND user_id = $2",
        [goalId, userId]
      );

      if (historyGoal.rows.length === 0) {
        console.log("⚠ Историческая цель не найдена!");
        return res
          .status(404)
          .json({ message: "Историческая цель не найдена." });
      }

      const historyGoalId = historyGoal.rows[0].id;
      console.log(`📜 Найден goal_history_id: ${historyGoalId}`);

      // ✅ 2️⃣ Загружаем транзакции из goals_history_transactions
      const result = await pool.query(
        "SELECT * FROM goals_history_transactions WHERE goal_history_id = $1 AND user_id = $2 ORDER BY date DESC",
        [historyGoalId, userId]
      );

      console.log(`✅ Найдено ${result.rows.length} транзакций.`);

      res.json(result.rows);
    } catch (error) {
      console.error("❌ Ошибка при получении транзакций из истории:", error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  }
);

router.post("/", authenticateToken, addGoal);
router.put("/:id", authenticateToken, updateGoal);
router.delete("/:id", authenticateToken, deleteGoal);
router.post("/:id/add-balance", authenticateToken, addBalanceToGoal);
router.post("/:id/withdraw", authenticateToken, withdrawFromGoal);

router.post("/:id/withdraw-balance", authenticateToken, withdrawFromGoal);

router.get("/:id", authenticateToken, getGoalById);

router.post("/:id/withdraw-full", authenticateToken, withdrawFullGoal);

module.exports = router;
