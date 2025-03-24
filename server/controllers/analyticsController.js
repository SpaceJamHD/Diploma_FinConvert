const pool = require("../models/userModel");

const getSpreadLossAnalytics = async (req, res) => {
  const userId = req.user.id;
  const { currency, range } = req.query;

  let truncLevel = "day";
  if (range === "today") truncLevel = "hour";
  else if (range === "week") truncLevel = "day";
  else if (range === "month") truncLevel = "day";

  let dateFrom = "NOW() - INTERVAL '7 days'";
  if (range === "today") dateFrom = "NOW() - INTERVAL '1 day'";
  else if (range === "month") dateFrom = "NOW() - INTERVAL '1 month'";

  try {
    const result = await pool.query(
      `
        SELECT 
          DATE_TRUNC('${truncLevel}', date) AS period,
          SUM(spread_loss) AS total_loss
        FROM currency_transactions
        WHERE user_id = $1
          AND to_currency = $2
          AND date >= ${dateFrom}
        GROUP BY period
        ORDER BY period ASC
        `,
      [userId, currency]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Помилка аналітики:", error);
    res.status(500).json({ message: "Помилка сервера" });
  }
};

module.exports = { getSpreadLossAnalytics };
