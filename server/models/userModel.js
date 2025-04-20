require("dotenv").config({ path: "./server/.env" });
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
});

const checkDbConnection = async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("База данных подключена успешно:", res.rows[0]);
  } catch (err) {
    console.error("Ошибка подключения к базе данных:", err);
  }
};

checkDbConnection();

module.exports = pool;
