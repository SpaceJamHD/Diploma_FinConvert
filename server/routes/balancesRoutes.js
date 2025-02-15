const express = require("express");
const router = express.Router();
const pool = require("../models/userModel");
const authenticateToken = require("../middleware/authenticateToken");

router.get("/", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  console.log(" Получаем баланс пользователя:", userId);

  try {
    const result = await pool.query(
      `SELECT 
        currency, 
        amount, 
        COALESCE(amount_btc, 0) AS amount_btc
      FROM balances WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Баланс не найден" });
    }

    const balances = {};
    result.rows.forEach(({ currency, amount, amount_btc }) => {
      balances[currency] =
        currency === "BTC" ? parseFloat(amount_btc) : parseFloat(amount);
    });

    console.log(" Баланс, отправленный клиенту:", balances);
    res.json(balances);
  } catch (error) {
    console.error(" Ошибка получения баланса:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = router;
