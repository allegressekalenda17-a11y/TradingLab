import { useState, useEffect, useRef } from 'react';

export interface TickData {
  quote: number;
  epoch: number;
  symbol: string;
}

export const useDerivTicks = (symbol: string) => {
  const [lastTick, setLastTick] = useState<TickData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const appId = import.meta.env.VITE_DERIV_APP_ID || '126885';
    const wsUrl = `wss://ws.derivws.com/websockets/v3?app_id=${appId}`;
    
    const connect = () => {
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
        setError(null);
        // Subscribe to ticks
        socket.send(JSON.stringify({
          ticks: symbol,
          subscribe: 1
        }));
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.error) {
          setError(data.error.message);
        } else if (data.msg_type === 'tick') {
          setLastTick({
            quote: data.tick.quote,
            epoch: data.tick.epoch,
            symbol: data.tick.symbol
          });
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
        // Reconnect after 3 seconds if not explicitly closed by us
        if (socketRef.current === socket) {
          setTimeout(connect, 3000);
        }
      };

      socket.onerror = () => {
        setError('Connection error');
      };
    };

    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [symbol]);

  return { lastTick, isConnected, error };
};
