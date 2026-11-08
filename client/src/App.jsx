import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { PassengerAuthProvider } from './context/PassengerAuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { ConductorAuthProvider } from './context/ConductorAuthContext';
import { SocketProvider } from './context/SocketContext';
import AppRoutes from './routes/AppRoutes';
import HologramLoader3D from './components/3d/HologramLoader3D';

export default function App() {
  const [showIntroLoader, setShowIntroLoader] = useState(() => {
    // Show high-impact 3D Holographic loader on session start
    return !sessionStorage.getItem('railbus_3d_intro_seen');
  });

  const handleLoaderComplete = () => {
    sessionStorage.setItem('railbus_3d_intro_seen', 'true');
    setShowIntroLoader(false);
  };

  return (
    <BrowserRouter>
      {showIntroLoader && (
        <div className="fixed inset-0 z-[9999] transition-opacity duration-500">
          <HologramLoader3D
            fullscreen
            message="INITIALIZING 3D SPATIAL TRANSIT MESH"
            onComplete={handleLoaderComplete}
          />
          <button
            onClick={handleLoaderComplete}
            className="absolute bottom-6 right-6 z-[10000] px-4 py-2 rounded-xl bg-[#0e1526]/80 hover:bg-[#162038] text-[#FE8505] border border-[#FE8505]/40 text-xs font-mono font-bold transition-all shadow-lg backdrop-blur-md"
          >
            SKIP 3D INTRO ➔
          </button>
        </div>
      )}

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
