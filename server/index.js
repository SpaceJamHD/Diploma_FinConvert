require("dotenv").config({ path: "./server/.env" });
console.log("ACCESS_TOKEN_SECRET:", process.env.ACCESS_TOKEN_SECRET);

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");

const userRoutes = require("./routes/userRoutes");
const balancesRoutes = require("./routes/balancesRoutes");
const goalsRoutes = require("./routes/goalsRoutes");
const exchangeRatesRoutes = require("./routes/exchangeRatesRoutes");
const cryptoRoutes = require("./routes/cryptoRoutes");
const transactionsRoutes = require("./routes/transactionsRoutes");
const autoPlanRoutes = require("./routes/autoPlanRoutes");

const { setupWebSocket } = require("./webSocket");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use("/api/users", userRoutes);
app.use("/api/balances", balancesRoutes);
app.use("/api/goals", goalsRoutes);
app.use("/api/exchange-rates", exchangeRatesRoutes);
app.use("/api", cryptoRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/auto-plan", autoPlanRoutes);

const PORT = 5000;

server.listen(PORT, () => {
  console.log(` Сервер запущен на http://localhost:${PORT}`);
});

setupWebSocket(server);
