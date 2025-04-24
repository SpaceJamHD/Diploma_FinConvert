const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../models/userModel");
const { broadcastVisitsUpdate } = require("../webSocket");
const JWT_SECRET = "secret007";

const registerUser = async (req, res) => {
  const { name, email, password, role = "user", timezone = "UTC" } = req.body;

  if (!name || !email || !password || !role) {
    return res
      .status(400)
      .json({ message: "Все поля обязательны для заполнения." });
  }

  try {
    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "Email уже зарегистрирован." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userResult = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id",
      [name, email, hashedPassword, role]
    );

    const userId = userResult.rows[0].id;

    const [firstName, lastName = ""] = name.trim().split(" ", 2);

    await pool.query(
      `INSERT INTO user_profiles (user_id, first_name, last_name, timezone) 
       VALUES ($1, $2, $3, $4)`,
      [userId, firstName, lastName, timezone]
    );

    await pool.query(
      `INSERT INTO balances (user_id, currency, amount, amount_btc, type) VALUES
       ($1, 'UAH', 25000, NULL, 'regular'),
       ($1, 'USD', 1200, NULL, 'regular'),
       ($1, 'EUR', 800, NULL, 'regular'),
       ($1, 'BTC', 0, 0.005, 'crypto')`,
      [userId]
    );

    res.status(201).json({
      message: "Пользователь успешно зарегистрирован, баланс создан.",
    });
  } catch (error) {
    console.error("Ошибка при регистрации пользователя:", error);
    res.status(500).json({ message: "Ошибка сервера." });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows.length === 0) {
      return res.status(404).json({ message: "Пользователь не найден." });
    }

    if (
      user.rows[0].banned_until &&
      new Date(user.rows[0].banned_until) < new Date()
    ) {
      await pool.query(
        "UPDATE users SET banned_until = NULL, block_reason = NULL, block_duration = NULL WHERE id = $1",
        [user.rows[0].id]
      );

      await pool.query(
        `INSERT INTO notifications (user_id, message, created_at, read)
         VALUES ($1, $2, NOW(), false)`,
        [user.rows[0].id, "Вас розблоковано. Вибачте за очікування."]
      );
    }

    if (
      user.rows[0].banned_until &&
      new Date(user.rows[0].banned_until) > new Date()
    ) {
      const remaining = Math.ceil(
        (new Date(user.rows[0].banned_until) - new Date()) / (1000 * 60 * 60)
      );

      return res.status(403).json({
        message: `Ваш обліковий запис заблоковано на ${remaining} год.`,
        banned: true,
        bannedUntil: user.rows[0].banned_until,
        reason: user.rows[0].block_reason,
      });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ message: "Неверный пароль." });
    }

    const token = jwt.sign(
      { id: user.rows[0].id, role: user.rows[0].role },
      JWT_SECRET,
      { expiresIn: "10h" }
    );

    res.status(200).json({ token, message: "Успешная авторизация." });
  } catch (error) {
    console.error("Ошибка при авторизации пользователя:", error);
    res.status(500).json({ message: "Ошибка сервера." });
  }
};

const getUserProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const profile = await pool.query(
      `SELECT u.name, u.email, u.role, p.phone, p.first_name, p.last_name, 
              p.address, p.city, p.country, p.postal_code, p.timezone
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [userId]
    );

    if (profile.rows.length === 0) {
      return res.status(404).json({ message: "Профиль не найден." });
    }

    res.status(200).json(profile.rows[0]);
  } catch (error) {
    console.error("Ошибка получения профиля:", error);
    res.status(500).json({ message: "Ошибка сервера." });
  }
};

const updateUserProfile = async (req, res) => {
  const {
    first_name,
    last_name,
    phone,
    address,
    city,
    country,
    postal_code,
    timezone = "UTC",
  } = req.body;
  const userId = req.user.id;

  try {
    await pool.query(
      `INSERT INTO user_profiles (
         user_id, first_name, last_name, phone, address, city, country, postal_code, timezone
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (user_id)
       DO UPDATE SET 
         first_name = EXCLUDED.first_name,
         last_name = EXCLUDED.last_name,
         phone = EXCLUDED.phone,
         address = EXCLUDED.address,
         city = EXCLUDED.city,
         country = EXCLUDED.country,
         postal_code = EXCLUDED.postal_code,
         timezone = EXCLUDED.timezone`,
      [
        userId,
        first_name,
        last_name,
        phone,
        address,
        city,
        country,
        postal_code,
        timezone,
      ]
    );

    res.status(200).json({ message: "Профиль успешно обновлен." });
  } catch (error) {
    console.error("Ошибка обновления профиля:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const recordPageVisit = async (req, res) => {
  const userId = req.user.id;
  const page_name = req.body.page || "home";

  try {
    // Проверка: уже есть визит на эту страницу сегодня?
    const existingVisit = await pool.query(
      `SELECT 1 FROM page_visits 
       WHERE user_id = $1 AND page_name = $2 AND visited_at::date = CURRENT_DATE`,
      [userId, page_name]
    );

    if (existingVisit.rows.length > 0) {
      return res
        .status(200)
        .json({ message: "Візит вже зафіксований сьогодні" });
    }

    // Запись нового визита
    await pool.query(
      "INSERT INTO page_visits (user_id, page_name, visited_at) VALUES ($1, $2, NOW())",
      [userId, page_name]
    );

    // Получение данных для обновления графика
    const result = await pool.query(
      `SELECT to_char(visited_at, 'YYYY-MM-DD') as date, COUNT(*) as count
       FROM page_visits
       WHERE user_id = $1
       GROUP BY date
       ORDER BY date ASC`,
      [userId]
    );

    broadcastVisitsUpdate(userId, result.rows);

    res.status(201).json({ message: "Візит зафіксований" });
  } catch (error) {
    console.error("Ошибка при записи визита:", error);
    res.status(500).json({ message: "Помилка сервера" });
  }
};

const getPageVisits = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT to_char(visited_at, 'YYYY-MM-DD') as date, COUNT(*) as count
       FROM page_visits
       WHERE user_id = $1
       GROUP BY date
       ORDER BY date ASC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка получения визитов:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  recordPageVisit,
  getPageVisits,
};
