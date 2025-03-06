const express = require("express");
const router = express.Router();
const pool = require("../models/userModel");
const {
  getUserTransactions,
  getTransactionsByGoalId,
  createTransaction,
} = require("../controllers/transactionsController");
const authenticateToken = require("../middleware/authenticateToken");

router.get("/", authenticateToken, getUserTransactions);

router.get("/history", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { start, end } = req.query;

  try {
    let query = `SELECT * FROM currency_transactions WHERE user_id = $1`;
    let params = [userId];

    if (start && end) {
      query += ` AND date BETWEEN $2 AND $3`;
      params.push(start, end);
    }

    query += ` ORDER BY date DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка при получении истории транзакций:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.get("/:goalId", authenticateToken, getTransactionsByGoalId);

router.post("/", authenticateToken, createTransaction);

router.delete("/", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    await pool.query("DELETE FROM currency_transactions WHERE user_id = $1", [
      userId,
    ]);
    res.json({ message: "История транзакций очищена" });
  } catch (error) {
    console.error("Ошибка при очистке истории:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = router;
