import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { PassengerAuthProvider } from './context/PassengerAuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { ConductorAuthProvider } from './context/ConductorAuthContext';
import { SocketProvider } from './context/SocketContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <SocketProvider>
        <PassengerAuthProvider>
          <AdminAuthProvider>
            <ConductorAuthProvider>
              <AppRoutes />
            </ConductorAuthProvider>
          </AdminAuthProvider>
        </PassengerAuthProvider>
      </SocketProvider>
    </BrowserRouter>
  );
}
