const WebSocket = require("ws");
const pool = require("./models/userModel"); // Доступ к базе данных

let wss;

const setupWebSocket = (server) => {
  wss = new WebSocket.Server({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  });

  wss.on("connection", (ws) => {
    console.log("🔌 WebSocket клиент подключился");
  });
};

// Функция для отправки обновленного баланса всем клиентам
const broadcastBalanceUpdate = async (userId) => {
  if (!wss) {
    console.error("❌ WebSocket сервер не инициализирован");
    return;
  }

  try {
    const balanceResult = await pool.query(
      `SELECT currency, amount, COALESCE(amount_btc, 0) AS amount_btc FROM balances WHERE user_id = $1`,
      [userId]
    );

    const balances = {};
    balanceResult.rows.forEach(({ currency, amount, amount_btc }) => {
      balances[currency] = currency === "BTC" ? amount_btc : amount;
    });

    const message = JSON.stringify({ type: "BALANCE_UPDATE", data: balances });

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });

    console.log("📡 Баланс обновлен и отправлен клиентам:", balances);
  } catch (error) {
    console.error("❌ Ошибка обновления WebSocket баланса:", error);
  }
};

module.exports = { setupWebSocket, broadcastBalanceUpdate };
