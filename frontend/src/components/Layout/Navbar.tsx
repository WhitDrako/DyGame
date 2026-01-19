import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Anchor,
  Home,
  Search,
  Scale,
  Shield,
  LogOut,
  Menu,
  X,
  User,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/catalog', label: 'Catalog', icon: Search },
    { path: '/trade', label: 'Trade Comparator', icon: Scale },
  ];

  const adminLinks = [
    { path: '/admin', label: 'Admin Panel', icon: Shield },
  ];

  return (
    <nav className="bg-ocean-900/95 backdrop-blur-md border-b border-ocean-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg flex items-center justify-center shadow-glow-gold group-hover:scale-105 transition-transform">
              <Anchor className="w-6 h-6 text-ocean-900" />
            </div>
            <span className="font-display text-xl font-bold text-gradient-gold hidden sm:block">
              GPO Trading
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link flex items-center gap-2 ${
                  isActive(link.path) ? 'nav-link-active' : ''
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}

            {user?.isAdmin &&
              adminLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-link flex items-center gap-2 text-gold-400 ${
                    isActive(link.path) ? 'nav-link-active' : ''
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-ocean-300">
              <User className="w-4 h-4" />
              <span className="font-medium">{user?.username}</span>
              {user?.isAdmin && (
                <span className="px-2 py-0.5 bg-gold-500/20 text-gold-400 text-xs font-medium rounded">
                  ADMIN
                </span>
              )}
            </div>

            <button
              onClick={logout}
              className="hidden sm:flex items-center gap-2 text-ocean-400 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Logout</span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-ocean-300 hover:text-white"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-ocean-700/50">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`nav-link flex items-center gap-2 ${
                    isActive(link.path) ? 'nav-link-active' : ''
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}

              {user?.isAdmin &&
                adminLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`nav-link flex items-center gap-2 text-gold-400 ${
                      isActive(link.path) ? 'nav-link-active' : ''
                    }`}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                ))}

              <div className="border-t border-ocean-700/50 my-2 pt-2">
                <div className="flex items-center gap-2 text-ocean-300 px-4 py-2">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{user?.username}</span>
                  {user?.isAdmin && (
                    <span className="px-2 py-0.5 bg-gold-500/20 text-gold-400 text-xs font-medium rounded">
                      ADMIN
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 text-ocean-400 hover:text-red-400 transition-colors px-4 py-2 w-full"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
