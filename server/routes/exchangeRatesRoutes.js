const express = require("express");
const { getExchangeRate } = require("../utils/exchangeRates");
const router = express.Router();

router.get("/", async (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(400).json({ message: "Укажите параметры from и to" });
  }

  try {
    const rate = await getExchangeRate(from, to);
    if (!rate) {
      return res.status(500).json({ message: "Ошибка получения курса" });
    }
    res.json({ rate });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = router;
