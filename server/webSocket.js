const WebSocket = require("ws");
const pool = require("./models/userModel");

let wss;

const setupWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    console.log("Клиент WebSocket подключен");
  });

  wss.on("connection", (ws) => {
    // console.log(" WebSocket клиент подключился");
  });
};

const broadcastBalanceUpdate = async (userId) => {
  if (!wss) {
    console.error(" WebSocket сервер не инициализирован");
    return;
  }

  try {
    const balanceResult = await pool.query(
      `SELECT currency, amount, COALESCE(amount_btc, 0) AS amount_btc 
       FROM balances WHERE user_id = $1`,
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

    console.log(" Баланс обновлен и отправлен клиентам:", balances);
  } catch (error) {
    console.error(" Ошибка обновления WebSocket баланса:", error);
  }
};

const broadcastVisitsUpdate = async (userId) => {
  if (!wss) {
    console.error(" WebSocket сервер не инициализирован");
    return;
  }

  try {
    const result = await pool.query(
      `SELECT to_char(visited_at, 'YYYY-MM-DD') as date, COUNT(*) as count
       FROM page_visits
       WHERE user_id = $1
       GROUP BY date
       ORDER BY date ASC`,
      [userId]
    );

    const visits = result.rows;

    const message = JSON.stringify({
      type: "VISITS_UPDATE",
      data: visits,
    });

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });

    console.log(" Визиты обновлены и отправлены клиентам:", visits);
  } catch (error) {
    console.error(" Ошибка отправки визитов через WebSocket:", error);
  }
};

module.exports = {
  setupWebSocket,
  broadcastBalanceUpdate,
  broadcastVisitsUpdate,
};
