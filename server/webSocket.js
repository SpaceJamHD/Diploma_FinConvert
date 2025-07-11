const WebSocket = require("ws");
const pool = require("./models/userModel");

let wss;

const setupWebSocket = (server) => {
  wss = new WebSocket.Server({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
      console.log("WebSocket подключен");

      ws.isAlive = true;

      ws.on("pong", () => {
        ws.isAlive = true;
      });

      ws.on("message", (message) => {
        console.log("Получено сообщение от клиента:", message);
      });

      ws.on("close", () => {
        console.log("WebSocket отключен");
      });
    });
  });

  wss.on("connection", (ws) => {
    console.log("Новый клиент подключен через WebSocket");
  });

  setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) {
        console.warn("Клиент не ответил на ping — соединение закрыто");
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);
};

const broadcastBalanceUpdate = async (userId) => {
  if (!wss) {
    console.error("WebSocket сервер не инициализирован");
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

    console.log("Баланс отправлен всем WebSocket клиентам:", balances);
  } catch (error) {
    console.error("Ошибка при отправке баланса по WebSocket:", error);
  }
};

const broadcastVisitsUpdate = async (userId) => {
  if (!wss) {
    console.error("WebSocket сервер не инициализирован");
    return;
  }

  if (!userId || typeof userId !== "number") {
    console.error("Некорректный userId:", userId);
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

    const visits = result.rows.map((row) => ({
      date: row.date,
      count: Number(row.count),
    }));

    const message = JSON.stringify({
      type: "VISITS_UPDATE",
      data: visits,
    });

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });

    console.log("Визиты отправлены WebSocket клиентам:", visits);
  } catch (error) {
    console.error("Ошибка при отправке визитов через WebSocket:", error);
  }
};

module.exports = {
  setupWebSocket,
  broadcastBalanceUpdate,
  broadcastVisitsUpdate,
};
