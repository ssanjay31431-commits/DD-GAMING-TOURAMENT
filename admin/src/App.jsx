import React from 'react';
import { AdminProvider } from './context/AdminContext';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <AdminProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-rose-500 selection:text-white">
        <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-600 to-purple-600 flex items-center justify-center font-heading font-black text-white text-base shadow-lg shadow-rose-500/20">
                ⚡
              </div>
              <span className="font-heading font-black text-lg text-white">
                DD GAMING <span className="text-rose-400">ADMIN</span>
              </span>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              STANDALONE ADMIN PORTAL
            </span>
          </div>
        </header>

        <main className="py-4">
          <AdminDashboard />
        </main>
      </div>
    </AdminProvider>
  );
}
