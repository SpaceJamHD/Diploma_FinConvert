const { getExchangeRate } = require("../utils/exchangeRates");

const getExchangeRates = async (req, res) => {
  const { from, to } = req.query;

  try {
    console.log(`💱 Запрос курса: ${from} → ${to}`);
    const rate = await getExchangeRate(from, to);

    if (!rate) {
      return res.status(400).json({ message: "Ошибка получения курса валют" });
    }

    res.json({ rate });
  } catch (error) {
    console.error("❌ Ошибка запроса курса валют:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

module.exports = { getExchangeRates };
