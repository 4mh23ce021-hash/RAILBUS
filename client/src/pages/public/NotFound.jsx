import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6">
        <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: '10s' }} />
      </div>
      <h1 className="text-4xl font-extrabold text-white">404 — Route Not Found</h1>
      <p className="mt-3 text-slate-400 max-w-md text-sm">
        The transit terminal or navigation route you requested is unavailable or has been relocated.
      </p>
      <Link
        to="/"
        className="mt-8 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium text-sm flex items-center space-x-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Platform Home</span>
      </Link>
    </div>
  );
}
