import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { detectAndLoadCompany } from '../lib/domainDetection';

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const { itemCount, openCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [company, setCompany] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    detectAndLoadCompany().then(({ company }) => {
      if (company) setCompany(company);
    });
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setMobileMenuOpen(false);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Products' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0.75rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Logo/Brand */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              textDecoration: 'none',
              color: '#000'
            }}
          >
            <span style={{
              fontWeight: 700,
              fontSize: '1.25rem',
              letterSpacing: '-0.02em',
              color: '#000'
            }}>
              {company?.name || 'Steel Store'}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2.5rem'
          }}
          className="desktop-nav">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  color: isActive(link.to) ? '#dc2626' : '#000',
                  textDecoration: 'none',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => !isActive(link.to) && (e.target.style.color = '#dc2626')}
                onMouseLeave={(e) => !isActive(link.to) && (e.target.style.color = '#000')}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            {/* Cart Button */}
            <button
              onClick={openCart}
              style={{
                background: 'transparent',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '0.5rem 1rem',
                color: '#000',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem',
                position: 'relative',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#dc2626';
                e.currentTarget.style.color = '#dc2626';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.color = '#000';
              }}
            >
              <ShoppingCart size={18} />
              <span className="desktop-only">Cart</span>
              {itemCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  background: '#dc2626',
                  color: 'white',
                  borderRadius: '999px',
                  padding: '2px 6px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  minWidth: '20px',
                  textAlign: 'center'
                }}>
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Menu - Desktop */}
            <div className="desktop-nav">
              {user ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <Link
                    to="/profile"
                    style={{
                      color: '#000',
                      textDecoration: 'none',
                      fontWeight: 500,
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <User size={18} />
                    <span>{profile?.name?.split(' ')[0] || 'Profile'}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: '0.5rem',
                      color: '#6b7280',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  style={{
                    background: '#000',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.5rem 1.25rem',
                    color: 'white',
                    fontWeight: 500,
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    display: 'inline-block',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#dc2626'}
                  onMouseLeave={(e) => e.target.style.background = '#000'}
                >
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#000',
                cursor: 'pointer',
                padding: '0.5rem',
                display: 'none'
              }}
              className="mobile-menu-btn"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: '60px',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'white',
            zIndex: 999,
            padding: '2rem',
            overflowY: 'auto',
            borderTop: '1px solid #e5e7eb'
          }}
          className="mobile-menu"
        >
          <nav style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  color: isActive(link.to) ? '#dc2626' : '#000',
                  textDecoration: 'none',
                  fontWeight: 500,
                  fontSize: '1.1rem',
                  padding: '0.75rem 0',
                  borderBottom: '1px solid #f3f4f6'
                }}
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    color: '#000',
                    textDecoration: 'none',
                    fontWeight: 500,
                    fontSize: '1.1rem',
                    padding: '0.75rem 0',
                    borderBottom: '1px solid #f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <User size={20} />
                  {profile?.name || 'Profile'}
                </Link>
                <Link
                  to="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    color: '#000',
                    textDecoration: 'none',
                    fontWeight: 500,
                    fontSize: '1.1rem',
                    padding: '0.75rem 0',
                    borderBottom: '1px solid #f3f4f6'
                  }}
                >
                  My Orders
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    background: '#000',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '1rem',
                    color: 'white',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontSize: '1rem',
                    textAlign: 'center',
                    marginTop: '1rem'
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  background: '#000',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '1rem',
                  color: 'white',
                  fontWeight: 500,
                  textDecoration: 'none',
                  fontSize: '1rem',
                  textAlign: 'center',
                  display: 'block',
                  marginTop: '1rem'
                }}
              >
                Login / Register
              </Link>
            )}
          </nav>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
          .desktop-only {
            display: none !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-menu {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
