import { useEffect, useRef } from "react";

const useWebSocket = (updateBalance) => {
  const wsRef = useRef(null);

  useEffect(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }

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
          console.log(" Получено обновление баланса:", message.data);
          updateBalance(message.data);
        }
      } catch (error) {
        console.error("Ошибка обработки WebSocket:", error);
      }
    };

    ws.onclose = () => {
      console.log(" WebSocket отключен. Переподключение через 3 сек...");

      setTimeout(() => {
        const newWs = new WebSocket(`${apiUrl}/ws`);
        wsRef.current = newWs;

        newWs.onopen = ws.onopen;
        newWs.onmessage = ws.onmessage;
        newWs.onclose = ws.onclose;
      }, 3000);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [updateBalance]);

  return wsRef.current;
};

export default useWebSocket;
