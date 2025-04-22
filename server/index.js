require("dotenv").config({ path: "./server/.env" });

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const cron = require("node-cron");
const path = require("path");

const userRoutes = require("./routes/userRoutes");
const balancesRoutes = require("./routes/balancesRoutes");
const goalsRoutes = require("./routes/goalsRoutes");
const exchangeRatesRoutes = require("./routes/exchangeRatesRoutes");
const cryptoRoutes = require("./routes/cryptoRoutes");
const transactionsRoutes = require("./routes/transactionsRoutes");
const autoPlanRoutes = require("./routes/autoPlanRoutes");
const notificationsRoutes = require("./routes/notificationsRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const adminRoutes = require("./routes/adminRoutes");

const { setupWebSocket } = require("./webSocket");
const { runAutoPlansNow } = require("./controllers/autoPlanController");
const pool = require("./models/userModel");

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: "https://diploma-finconvert.onrender.com",
    credentials: true,
  })
);

app.use(express.json());
app.use(bodyParser.json());

app.use("/api/users", userRoutes);
app.use("/api/balances", balancesRoutes);
app.use("/api/goals", goalsRoutes);
app.use("/api/exchange-rates", exchangeRatesRoutes);
app.use("/api", cryptoRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/auto-plan", autoPlanRoutes);
app.use("/api/auto-goal-plans", autoPlanRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin", adminRoutes);

app.use(express.static(path.join(__dirname, "../client/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});

setupWebSocket(server);

cron.schedule("* * * * *", async () => {
  console.log("Cron job: запуск авто-поповнень...");
  try {
    const { rows } = await pool.query(
      `SELECT DISTINCT user_id FROM public.auto_goal_plans
       WHERE next_execution::date <= NOW()::date
         AND (execution_time IS NULL OR execution_time <= TO_CHAR(NOW(), 'HH24:MI:SS')::time)`
    );

    for (const user of rows) {
      console.log(`Processing auto plans for user: ${user.user_id}`);
      const fakeReq = { user: { id: user.user_id } };
      const fakeRes = {
        status: () => ({ json: () => {} }),
        json: () => {},
      };
      await runAutoPlansNow(fakeReq, fakeRes);
    }
  } catch (err) {
    console.error("Error during Cron execution:", err);
  }
});
