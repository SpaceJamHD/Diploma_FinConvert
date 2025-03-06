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
  getGoalById,
} = require("../controllers/goalsController");
const authenticateToken = require("../middleware/authenticateToken");

router.get("/", authenticateToken, getGoals);
router.get("/history", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { start, end } = req.query;

  try {
    let query = `SELECT * FROM goals WHERE user_id = $1 AND completed_at IS NOT NULL`;
    let params = [userId];

    if (start && end) {
      query += ` AND completed_at BETWEEN $2 AND $3`;
      params.push(start, end);
    }

    query += ` ORDER BY completed_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка при получении истории целей:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.post("/", authenticateToken, addGoal);
router.put("/:id", authenticateToken, updateGoal);
router.delete("/:id", authenticateToken, deleteGoal);
router.post("/:id/add-balance", authenticateToken, addBalanceToGoal);
router.post("/:id/withdraw", authenticateToken, withdrawFromGoal);

router.post("/:id/withdraw-balance", authenticateToken, withdrawFromGoal);

router.get("/:id", authenticateToken, getGoalById);

router.post("/:id/withdraw-full", authenticateToken, withdrawFullGoal);

module.exports = router;
