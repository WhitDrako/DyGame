import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import BanScreen from './components/BanScreen';
import Loading from './components/ui/Loading';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ItemDetail from './pages/ItemDetail';
import TradeComparator from './pages/TradeComparator';
import Admin from './pages/Admin';

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isBanned, banReason, token } = useAuth();

  if (isLoading) {
    return <Loading fullScreen message="Authenticating..." />;
  }

  // Show ban screen if user is banned
  if (isBanned) {
    return <BanScreen reason={banReason} />;
  }

  // Redirect to login if not authenticated
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Public Route wrapper (redirects to home if logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isBanned, banReason, token } = useAuth();

  if (isLoading) {
    return <Loading fullScreen message="Loading..." />;
  }

  // Show ban screen even on public routes
  if (isBanned) {
    return <BanScreen reason={banReason} />;
  }

  // Redirect to home if already authenticated
  if (token && user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Admin Route wrapper
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isBanned, banReason, token } = useAuth();

  if (isLoading) {
    return <Loading fullScreen message="Authenticating..." />;
  }

  if (isBanned) {
    return <BanScreen reason={banReason} />;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Protected routes */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/item/:id" element={<ItemDetail />} />
        <Route path="/trade" element={<TradeComparator />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />
      </Route>

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
