const express = require("express");
const router = express.Router();

// Пример данных баланса
const balances = {
  UAH: 25000,
  USD: 1200,
  BTC: 0.005,
};

// Получение балансов
router.get("/", (req, res) => {
  res.json(balances);
});

module.exports = router;
