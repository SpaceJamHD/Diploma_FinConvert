const express = require("express");
const router = express.Router();
const { getExchangeRate } = require("../utils/exchangeRates");

router.get("/", async (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(400).json({ message: "Неверные параметры запроса" });
  }

  try {
    const rate = await getExchangeRate(from, to);
    if (!rate) {
      return res.status(404).json({ message: "Курс не найден" });
    }

    res.json({ rate });
  } catch (error) {
    console.error("Ошибка получения курса валют:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = router;
