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
