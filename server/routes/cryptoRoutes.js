const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();
const { getCryptoToFiatRate } = require("../utils/exchangeRates");

router.get("/crypto-convert", async (req, res) => {
  const { fromCurrency, toCurrency, amount } = req.query;

  try {
    const convertedAmount = await getCryptoToFiatRate(
      fromCurrency,
      toCurrency,
      amount
    );
    res.json({ convertedAmount });
  } catch (error) {
    console.error("Ошибка при конвертации криптовалюты:", error);
    res
      .status(500)
      .json({ error: "Ошибка сервера при конвертации криптовалюты" });
  }
});

module.exports = router;
