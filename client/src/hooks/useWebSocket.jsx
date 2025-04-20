import { useEffect, useRef } from "react";

const useWebSocket = (updateBalance) => {
  const wsRef = useRef(null);

  useEffect(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket(
      "wss://diploma-finconvert-frontend.onrender.com/ws"
    );

    wsRef.current = ws;

    ws.onopen = () => {
      console.log(" WebSocket подключен");
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "BALANCE_UPDATE") {
          console.log(" Обновленный баланс:", message.data);
          updateBalance(message.data);
        }
      } catch (error) {
        console.error(" Ошибка обработки WebSocket сообщения:", error);
      }
    };

    ws.onclose = () => {
      console.log(" WebSocket отключен. Переподключение через 3 сек...");
      setTimeout(() => {
        wsRef.current = new WebSocket(
          "wss://diploma-finconvert-frontend.onrender.com/ws"
        );
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
