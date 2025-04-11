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

const getGoalsDistributionAnalytics = async (req, res) => {
  const userId = req.user.id;
  const { range = "month" } = req.query;

  let dateCondition = "";
  if (range === "today") {
    dateCondition = "AND date::date = CURRENT_DATE";
  } else if (range === "week") {
    dateCondition = "AND date >= CURRENT_DATE - INTERVAL '7 days'";
  } else {
    dateCondition = "AND date >= CURRENT_DATE - INTERVAL '1 month'";
  }

  try {
    const result = await pool.query(
      `
      WITH all_tx AS (
        SELECT 
          g.id AS goal_id,
          g.name,
          t.original_amount,
          t.from_currency,
          t.amount,
          g.currency AS goal_currency,
          t.date
        FROM transactions t
        JOIN goals g ON g.id = t.goal_id
        WHERE t.user_id = $1 AND t.type = 'income' ${dateCondition}

        UNION ALL

        SELECT 
          gh.goal_id,
          gh.name,
          th.original_amount,
          th.from_currency,
          th.amount,
          gh.currency AS goal_currency,
          th.date
        FROM goals_history_transactions th
        JOIN goals_history gh ON gh.id = th.goal_history_id
        WHERE th.user_id = $1 AND th.type = 'income' ${dateCondition}
      ),
      grouped_tx AS (
        SELECT 
          goal_id,
          name,
          goal_currency,
          from_currency,
          SUM(original_amount)::numeric(18,8) AS original,
          SUM(amount)::numeric(18,2) AS total
        FROM all_tx
        GROUP BY goal_id, name, goal_currency, from_currency
      )
      SELECT 
        goal_id,
        name,
        goal_currency,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'from_currency', from_currency,
            'original', original,
            'total', total
          )
        ) AS contributions,
        SUM(total)::numeric(18,2) AS total_uah
      FROM grouped_tx
      GROUP BY goal_id, name, goal_currency
      ORDER BY total_uah DESC
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Помилка при отриманні розподілу цілей:", error.message);
    res.status(500).json({ message: "Помилка сервера при розрахунку цілей" });
  }
};

const getNextMonthForecast = async (req, res) => {
  const userId = req.user.id;

  try {
    const incomeQuery = await pool.query(
      `SELECT SUM(amount) AS total_income
       FROM transactions
       WHERE user_id = $1 AND type = 'income' AND date >= NOW() - INTERVAL '30 days'`,
      [userId]
    );

    const withdrawQuery = await pool.query(
      `SELECT SUM(amount) AS total_withdraw
       FROM transactions
       WHERE user_id = $1 AND type = 'withdraw' AND date >= NOW() - INTERVAL '30 days'`,
      [userId]
    );

    const lossAndWithdrawQuery = await pool.query(
      `SELECT 
         SUM(
           CASE 
             WHEN to_currency = 'BTC' THEN spread_loss * 1300000
             WHEN to_currency = 'USD' THEN spread_loss * 39
             WHEN to_currency = 'EUR' THEN spread_loss * 42.5
             ELSE spread_loss
           END
         ) AS total_spread,
         SUM(
           CASE 
             WHEN type = 'withdraw-conversion' THEN 
               CASE 
                 WHEN to_currency = 'BTC' THEN amount * 1300000
                 WHEN to_currency = 'USD' THEN amount * 39
                 WHEN to_currency = 'EUR' THEN amount * 42.5
                 ELSE amount
               END
             ELSE 0
           END
         ) AS withdraw_conversion
       FROM currency_transactions
       WHERE user_id = $1 AND date >= NOW() - INTERVAL '30 days'`,
      [userId]
    );

    const balancesQuery = await pool.query(
      `SELECT SUM(
        CASE 
          WHEN currency = 'BTC' THEN COALESCE(amount_btc, 0) * 1300000
          WHEN currency = 'USD' THEN amount * 39
          WHEN currency = 'EUR' THEN amount * 42.5
          ELSE amount
        END
      ) AS total_balance
      FROM balances
      WHERE user_id = $1`,
      [userId]
    );

    const income = parseFloat(incomeQuery.rows[0].total_income) || 0;
    const spread = parseFloat(lossAndWithdrawQuery.rows[0].total_spread) || 0;
    const withdraw = parseFloat(withdrawQuery.rows[0].total_withdraw) || 0;
    const withdrawConversion =
      parseFloat(lossAndWithdrawQuery.rows[0].withdraw_conversion) || 0;
    const balance = parseFloat(balancesQuery.rows[0].total_balance) || 0;

    const expenses = spread + withdraw + withdrawConversion;
    const expectedBalance = balance + income - expenses;
    const balanceChangePercent =
      balance > 0 ? ((expectedBalance - balance) / balance) * 100 : 0;

    const goalsCountQuery = await pool.query(
      `SELECT COUNT(*) AS count FROM goals WHERE user_id = $1`,
      [userId]
    );
    const goalsCount = parseInt(goalsCountQuery.rows[0].count) || 0;

    const conversionsQuery = await pool.query(
      `SELECT COUNT(*) AS count
       FROM currency_transactions
       WHERE user_id = $1 AND type = 'conversion' AND date >= NOW() - INTERVAL '30 days'`,
      [userId]
    );
    const conversionsCount = parseInt(conversionsQuery.rows[0].count) || 0;

    res.json({
      balance,
      income,
      expenses,
      expectedBalance,
      balanceChangePercent,
      goalsCount,
      conversionsCount,
    });
  } catch (error) {
    console.error("Forecast error:", error);
    res.status(500).json({ message: "Помилка сервера при прогнозі" });
  }
};

const getSpreadLossTotalUAH = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT to_currency, SUM(spread_loss) AS loss
       FROM currency_transactions
       WHERE user_id = $1
       GROUP BY to_currency`,
      [userId]
    );

    let total = 0;
    for (const row of result.rows) {
      const { to_currency, loss } = row;

      let rate = 1;
      if (to_currency === "USD") rate = 39;
      else if (to_currency === "EUR") rate = 42;
      else if (to_currency === "BTC") rate = 1300000;

      total += parseFloat(loss) * rate;
    }

    res.json({ total_loss: total });
  } catch (error) {
    console.error("Помилка підрахунку втрат:", error);
    res.status(500).json({ message: "Помилка сервера" });
  }
};

const getConversionDirectionsAnalytics = async (req, res) => {
  const userId = req.user.id;
  const { range = "month" } = req.query;

  let dateFrom = "NOW() - INTERVAL '1 month'";
  if (range === "today") dateFrom = "NOW() - INTERVAL '1 day'";
  else if (range === "week") dateFrom = "NOW() - INTERVAL '7 days'";

  try {
    const result = await pool.query(
      `SELECT CONCAT(from_currency, ' → ', to_currency) AS direction,
              COUNT(*) AS count
       FROM currency_transactions
       WHERE user_id = $1 AND date >= ${dateFrom}
       GROUP BY direction
       ORDER BY count DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Помилка аналітики напрямків конвертацій:", error);
    res.status(500).json({ message: "Помилка сервера" });
  }
};

module.exports = {
  getSpreadLossAnalytics,
  getGoalsDistributionAnalytics,
  getNextMonthForecast,
  getSpreadLossTotalUAH,
  getConversionDirectionsAnalytics,
};
