const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../models/userModel");

const JWT_SECRET = "secret007";

const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

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
              p.address, p.city, p.country, p.postal_code
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
  const { first_name, last_name, phone, address, city, country, postal_code } =
    req.body;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `INSERT INTO user_profiles (user_id, first_name, last_name, phone, address, city, country, postal_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (user_id)
       DO UPDATE SET 
         first_name = EXCLUDED.first_name,
         last_name = EXCLUDED.last_name,
         phone = EXCLUDED.phone,
         address = EXCLUDED.address,
         city = EXCLUDED.city,
         country = EXCLUDED.country,
         postal_code = EXCLUDED.postal_code`,
      [
        userId,
        first_name,
        last_name,
        phone,
        address,
        city,
        country,
        postal_code,
      ]
    );

    res.status(200).json({ message: "Профиль успешно обновлен." });
  } catch (error) {
    console.error("Ошибка обновления профиля:", error);
    res.status(500).json({ message: "Ошибка сервера." });
  }
};

module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile };
