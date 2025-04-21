import { useEffect, useRef } from "react";

const useWebSocket = (updateBalance) => {
  const wsRef = useRef(null);
  const reconnectTimeout = useRef(null);
  const isMounted = useRef(true);

  const connect = () => {
    const apiUrl = process.env.REACT_APP_API_URL.replace("https", "wss");
    const ws = new WebSocket(`${apiUrl}/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(" WebSocket подключен");
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "BALANCE_UPDATE") {
          console.log(" Обновление баланса из WS:", message.data);
          if (isMounted.current) {
            updateBalance(message.data);
          }
        }
      } catch (error) {
        console.error("Ошибка обработки WebSocket-сообщения:", error);
      }
    };

    ws.onclose = () => {
      console.warn("WebSocket отключен. Переподключаем через 3 сек...");
      if (isMounted.current) {
        reconnectTimeout.current = setTimeout(connect, 3000);
      }
    };

    ws.onerror = (err) => {
      console.error(" WebSocket ошибка:", err);
      ws.close();
    };
  };

  useEffect(() => {
    isMounted.current = true;
    connect();

    return () => {
      isMounted.current = false;
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [updateBalance]);

  return wsRef.current;
};

export default useWebSocket;
