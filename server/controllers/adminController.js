const pool = require("../models/userModel");

const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(`
        SELECT 
          u.id,
          u.name,
          u.email,
          u.role,
          u.created_at,
          u.banned_until,
          p.city
        FROM users u
        LEFT JOIN user_profiles p ON u.id = p.user_id
        ORDER BY u.id
      `);
    res.json(result.rows);
  } catch (err) {
    console.error("Помилка отримання користувачів:", err);
    res.status(500).json({ message: "Помилка сервера" });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    res.status(200).json({ message: "Користувача видалено." });
  } catch (err) {
    console.error("Ошибка удаления пользователя:", err);
    res.status(500).json({ message: "Ошибка сервера." });
  }
};

const banUser = async (req, res) => {
  const { id } = req.params;
  const { durationMinutes, reason } = req.body;

  try {
    const bannedUntil = new Date(Date.now() + durationMinutes * 60 * 1000);
    await pool.query(
      `UPDATE users SET banned_until = $1, block_reason = $2, block_duration = make_interval(mins => $3) WHERE id = $4`,
      [bannedUntil, reason, durationMinutes, id]
    );

    res
      .status(200)
      .json({ message: `Користувача заблоковано до ${bannedUntil}` });
  } catch (err) {
    console.error("Ошибка при блокировке:", err);
    res.status(500).json({ message: "Ошибка сервера." });
  }
};

const unbanUser = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      `UPDATE users SET banned_until = NULL, block_reason = NULL, block_duration = NULL WHERE id = $1`,
      [id]
    );

    await pool.query(
      `INSERT INTO notifications (user_id, message, created_at, read)
         VALUES ($1, 'Ви розблоковані. Вибачте за очікування.', NOW(), false)`,
      [id]
    );

    res.status(200).json({ message: "Користувача розблоковано." });
  } catch (err) {
    console.error("Ошибка при розблокуванні:", err);
    res.status(500).json({ message: "Ошибка сервера." });
  }
};

const sendMessageToUser = async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  try {
    await pool.query(
      `INSERT INTO notifications (user_id, message, created_at, read) VALUES ($1, $2, NOW(), false)`,
      [id, message]
    );
    res.status(200).json({ message: "Повідомлення надіслано." });
  } catch (err) {
    console.error("Ошибка отправки сообщения:", err);
    res.status(500).json({ message: "Ошибка сервера." });
  }
};

const getSuspiciousUsers = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        u.id AS user_id,
        u.name,
        COUNT(t.id) AS transaction_count,

        COALESCE(SUM(
          CASE 
            WHEN t.to_currency = 'USD' THEN t.amount
            WHEN t.to_currency = 'UAH' THEN t.amount / 38.0
            WHEN t.to_currency = 'EUR' THEN t.amount * 1.08
            WHEN t.to_currency = 'BTC' THEN t.amount * 65000.0
            ELSE 0
          END
        ), 0) AS total_amount_usd,

        COALESCE(AVG(
          CASE 
            WHEN t.to_currency = 'USD' THEN t.amount
            WHEN t.to_currency = 'UAH' THEN t.amount / 38.0
            WHEN t.to_currency = 'EUR' THEN t.amount * 1.08
            WHEN t.to_currency = 'BTC' THEN t.amount * 65000.0
            ELSE 0
          END
        ), 0) AS avg_amount_usd,

        COALESCE(SUM(
          CASE 
            WHEN t.to_currency = 'USD' THEN t.spread_loss * 39
            WHEN t.to_currency = 'EUR' THEN t.spread_loss * 42
            WHEN t.to_currency = 'BTC' THEN t.spread_loss * 1300000
            ELSE t.spread_loss
          END
        ), 0) AS total_spread_loss,

        MAX(t.date) AS last_transaction,

        SUM(CASE WHEN t.from_currency = 'BTC' OR t.to_currency = 'BTC' THEN 1 ELSE 0 END) AS btc_transactions,

        SUM(CASE WHEN t.date > NOW() - INTERVAL '24 hours' THEN 1 ELSE 0 END) AS recent_transactions

      FROM users u
      LEFT JOIN currency_transactions t ON u.id = t.user_id
      GROUP BY u.id, u.name
      ORDER BY total_spread_loss DESC
      LIMIT 100
    `);

    res.json(rows);
  } catch (err) {
    console.error("Помилка при отриманні підозрілих користувачів:", err);
    res.status(500).json({ error: "Помилка сервера" });
  }
};

let cachedStats = null;
let cacheTimestamp = 0;

const getAdminStats = async (req, res) => {
  const now = Date.now();

  if (cachedStats && now - cacheTimestamp < 30000) {
    return res.json(cachedStats);
  }

  try {
    console.time("getAdminStats");

    const [
      totalUsers,
      activeUsers,
      bannedUsers,
      totalTransactions,
      suspiciousUsers,
    ] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM users"),
      pool.query(
        "SELECT COUNT(*) FROM users WHERE banned_until IS NULL OR banned_until < NOW()"
      ),
      pool.query(
        "SELECT COUNT(*) FROM users WHERE banned_until IS NOT NULL AND banned_until > NOW()"
      ),
      pool.query("SELECT COUNT(*) FROM currency_transactions"),
      pool.query(`
        SELECT COUNT(*) FROM (
          SELECT user_id
          FROM currency_transactions
          WHERE 
            date AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Kyiv' >= CURRENT_DATE
            AND date AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Kyiv' < CURRENT_DATE + INTERVAL '1 day'
          GROUP BY user_id
          HAVING COUNT(*) > 10
        ) suspicious;
      `),
    ]);

    const stats = {
      totalUsers: parseInt(totalUsers.rows[0].count),
      activeUsers: parseInt(activeUsers.rows[0].count),
      bannedUsers: parseInt(bannedUsers.rows[0].count),
      totalTransactions: parseInt(totalTransactions.rows[0].count),
      avgPerUser: (
        parseInt(totalTransactions.rows[0].count) /
        Math.max(parseInt(totalUsers.rows[0].count), 1)
      ).toFixed(2),
      suspiciousToday: parseInt(suspiciousUsers.rows[0].count),
    };

    cachedStats = stats;
    cacheTimestamp = now;

    console.timeEnd("getAdminStats");
    res.json(stats);
  } catch (err) {
    console.error("Помилка при отриманні статистики:", err);
    res.status(500).json({ message: "Помилка сервера" });
  }
};

const getTopSpendersToday = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.name, 
        u.email, 
        SUM(ct.amount) AS total_spent, 
        COUNT(*) AS transactions_count
      FROM currency_transactions ct
      JOIN users u ON ct.user_id = u.id
      WHERE 
        DATE(ct.date AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Kyiv') = CURRENT_DATE
        AND ct.amount > 0
        AND ct.type IN ('goal-conversion', 'manual', 'перевод')
      GROUP BY u.id, u.name, u.email
      ORDER BY total_spent DESC
      LIMIT 5;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка получения топ-пользователей:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

module.exports = {
  getAllUsers,
  deleteUser,
  banUser,
  unbanUser,
  sendMessageToUser,
  getSuspiciousUsers,
  getAdminStats,
  getTopSpendersToday,
};
