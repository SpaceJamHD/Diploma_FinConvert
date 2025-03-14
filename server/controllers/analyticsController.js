const pool = require("../models/userModel");

const getLossAnalysisData = async (req, res) => {
  try {
    const result = await pool.query(`
        SELECT date, amount, from_currency, to_currency, loss
        FROM currency_transactions
        WHERE date >= CURRENT_DATE
      `);

    console.log("Данные для анализа убытков:", result.rows); // Выведи в логи

    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка при получении данных для аналитики:", error);
    res
      .status(500)
      .json({ message: "Ошибка при получении данных для аналитики" });
  }
};

module.exports = { getLossAnalysisData };
