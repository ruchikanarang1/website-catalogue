import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { supabase } from './lib/supabase';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Products from './pages/Products';
import Cart from './pages/Cart';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Profile from './pages/Profile';
import OrderHistory from './pages/OrderHistory';

// Handles OAuth redirect back into the website
function AuthCallback() {
  const navigate = useNavigate();
  useEffect(() => {
    // Supabase JS automatically exchanges the code in the URL for a session.
    // We just need to wait for it then redirect home.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        subscription.unsubscribe();
        navigate('/', { replace: true });
      }
    });
    // Also check immediately in case session is already set
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/', { replace: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #eee', borderTop: '3px solid #dc2626', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: '#666', fontSize: '0.9rem' }}>Signing you in...</p>
    </div>
  );
}

function ProfileIncompletePrompt() {
  const { user, profile } = useAuth();
  const location = useLocation();
  const isIncomplete = user && profile && (!profile.name || profile.name === 'Customer' || !profile.phone);
  const isOnProfile = location.pathname === '/profile';
  if (!isIncomplete || isOnProfile) return null;
  return (
    <div style={{
      position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
      background: '#000', color: 'white', borderRadius: '8px',
      padding: '0.75rem 1.5rem', zIndex: 2000, display: 'flex', alignItems: 'center',
      gap: '1rem', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', whiteSpace: 'nowrap'
    }}>
      <span style={{ fontSize: '0.9rem' }}>Complete your profile to place orders</span>
      <a href="/profile" style={{
        background: '#dc2626', color: 'white', borderRadius: '4px',
        padding: '0.4rem 0.9rem', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem'
      }}>Complete Now</a>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <CartDrawer />
            <ProfileIncompletePrompt />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <OrderHistory />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <div>
        <h1 style={{ fontSize: '4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem' }}>
          404
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#64748b', margin: '0 0 2rem' }}>
          Page not found
        </p>
        <a
          href="/"
          style={{
            display: 'inline-block',
            background: '#FF6A00',
            color: 'white',
            padding: '0.75rem 2rem',
            borderRadius: '10px',
            textDecoration: 'none',
            fontWeight: 700
          }}
        >
          Go Home
        </a>
      </div>
    </div>
  );
}

export default App;
