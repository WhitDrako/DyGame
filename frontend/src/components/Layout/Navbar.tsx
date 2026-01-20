import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  Search,
  Calculator,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/catalog', label: 'Items', icon: Search },
    { path: '/trade', label: 'Calculator', icon: Calculator },
  ];

  return (
    <nav className="bg-ocean-900 border-b border-ocean-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">GPO</span>
            <span className="text-xl font-bold text-gold-400">Values</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-ocean-800 text-white'
                    : 'text-ocean-300 hover:text-white hover:bg-ocean-800/50'
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}

            {user?.isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/admin')
                    ? 'bg-gold-500/20 text-gold-400'
                    : 'text-gold-400/70 hover:text-gold-400 hover:bg-gold-500/10'
                }`}
              >
                <Settings className="w-4 h-4" />
                Admin
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-ocean-300 text-sm">{user?.username}</span>
              {user?.isAdmin && (
                <span className="px-1.5 py-0.5 bg-gold-500/20 text-gold-400 text-xs rounded">
                  Admin
                </span>
              )}
            </div>

            <button
              onClick={logout}
              className="hidden sm:flex items-center gap-1 text-ocean-400 hover:text-red-400 text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-ocean-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-ocean-800">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                    isActive(link.path)
                      ? 'bg-ocean-800 text-white'
                      : 'text-ocean-300 hover:bg-ocean-800/50'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}

              {user?.isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/admin')
                      ? 'bg-gold-500/20 text-gold-400'
                      : 'text-gold-400/70 hover:bg-gold-500/10'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  Admin
                </Link>
              )}

              <div className="border-t border-ocean-800 mt-2 pt-2">
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-ocean-300 text-sm">{user?.username}</span>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-ocean-400 hover:text-red-400 text-sm"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
