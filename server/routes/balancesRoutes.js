const express = require("express");
const router = express.Router();
const pool = require("../models/userModel"); // Доступ к базе
const authenticateToken = require("../middleware/authenticateToken"); // Проверка токена

router.get("/", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  console.log("🔹 Получаем баланс пользователя:", userId); // ✅ Лог для проверки

  try {
    const result = await pool.query(
      "SELECT currency, amount FROM balances WHERE user_id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Баланс не найден" });
    }

    const balances = {};
    result.rows.forEach(({ currency, amount }) => {
      balances[currency] = amount;
    });

    res.json(balances);
  } catch (error) {
    console.error("❌ Ошибка получения баланса:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = router;
