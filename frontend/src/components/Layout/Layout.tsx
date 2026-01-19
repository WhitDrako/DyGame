import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-ocean-900/50 border-t border-ocean-700/30 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-ocean-400 text-sm">
              GPO Trading Platform - Track and trade Grand Piece Online items
            </p>
            <p className="text-ocean-500 text-xs">
              Not affiliated with Roblox or Grand Piece Online
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
