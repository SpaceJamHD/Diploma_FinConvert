const pool = require("../models/userModel");

const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, role, banned_until FROM users ORDER BY id`
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Ошибка получения пользователей:", err);
    res.status(500).json({ message: "Ошибка сервера." });
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

module.exports = {
  getAllUsers,
  deleteUser,
  banUser,
  sendMessageToUser,
};
