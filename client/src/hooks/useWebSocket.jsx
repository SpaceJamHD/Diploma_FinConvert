import { useEffect, useRef } from "react";

const useWebSocket = (updateBalance) => {
  const wsRef = useRef(null);
  const reconnectTimeout = useRef(null);
  const isMounted = useRef(true);

  const connect = () => {
    const rawApi = process.env.REACT_APP_API_URL;
    const baseWsUrl =
      process.env.REACT_APP_WS_URL || rawApi?.replace("https", "wss");
    const wsUrl = `${baseWsUrl}/ws`;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log("WebSocket уже подключён");
      return;
    }

    console.log("Подключаемся к WebSocket:", wsUrl);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WebSocket подключен");
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "BALANCE_UPDATE" && isMounted.current) {
          console.log("📩 Обновление баланса из WS:", message.data);
          updateBalance(message.data);
        }
      } catch (error) {
        console.error("❌ Ошибка обработки WebSocket-сообщения:", error);
      }
    };

    ws.onclose = () => {
      console.warn("⚠️ WebSocket отключен. Переподключение через 3 сек...");
      if (isMounted.current) {
        reconnectTimeout.current = setTimeout(connect, 3000);
      }
    };

    ws.onerror = (err) => {
      console.error("🚨 WebSocket ошибка:", err);
      ws.close(); // вызовет onclose
    };
  };

  useEffect(() => {
    isMounted.current = true;
    connect();

    return () => {
      console.log("🧹 Очистка WebSocket-подключения");
      isMounted.current = false;
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };
  }, [updateBalance]);

  return wsRef.current;
};

export default useWebSocket;
