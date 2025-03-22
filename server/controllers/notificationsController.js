const pool = require("../models/userModel");

const getUserNotifications = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `SELECT id, message, created_at, read FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Ошибка при получении уведомлений:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const markNotificationsAsRead = async (req, res) => {
  const userId = req.user.id;
  try {
    await pool.query(
      `UPDATE notifications SET read = true WHERE user_id = $1`,
      [userId]
    );
    res.sendStatus(204);
  } catch (err) {
    console.error("Ошибка при обновлении уведомлений:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

module.exports = { getUserNotifications, markNotificationsAsRead };
