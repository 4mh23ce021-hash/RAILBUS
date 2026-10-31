import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [realtimeEvents, setRealtimeEvents] = useState([]);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);

      // Join rooms if tokens exist
      const adminToken = localStorage.getItem('railbus_admin_token');
      const passengerToken = localStorage.getItem('railbus_passenger_token');
      const conductorToken = localStorage.getItem('railbus_conductor_token');

      if (adminToken) {
        socketInstance.emit('join_room', { token: adminToken, role: 'admin' });
      }
      if (passengerToken) {
        socketInstance.emit('join_room', { token: passengerToken, role: 'passenger' });
      }
      if (conductorToken) {
        socketInstance.emit('join_room', { token: conductorToken, role: 'conductor' });
      }
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    // Capture operational events for real-time notifications
    const handleEvent = (eventName, data) => {
      setRealtimeEvents((prev) => [
        {
          id: Date.now() + Math.random(),
          eventName,
          data,
          receivedAt: new Date().toLocaleTimeString()
        },
        ...prev.slice(0, 19)
      ]);
    };

    socketInstance.on('pool:updated', (data) => handleEvent('pool:updated', data));
    socketInstance.on('pool:review_required', (data) => handleEvent('pool:review_required', data));
    socketInstance.on('pool:approved', (data) => handleEvent('pool:approved', data));
    socketInstance.on('train:status_updated', (data) => handleEvent('train:status_updated', data));
    socketInstance.on('ticket:boarded', (data) => handleEvent('ticket:boarded', data));
    socketInstance.on('dispatch:updated', (data) => handleEvent('dispatch:updated', data));

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, realtimeEvents }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
