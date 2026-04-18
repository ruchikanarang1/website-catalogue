import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, CheckCircle, Package } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { detectCompanyFromDomain } from '../lib/domainDetection';

export default function CartDrawer() {
  const { cart, isOpen, closeCart, updateQuantity, removeItem, clearCart, total, itemCount } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [referenceCode, setReferenceCode] = useState('');
  const [success, setSuccess] = useState(false);

  const orange = '#dc2626'; // Red accent
  const navy = '#000000'; // Black

  // Reset state when drawer opens
  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccess(false);
      setReferenceCode('');
    }
  }, [isOpen]);

  const handleClose = () => {
    closeCart();
    // Reset state after animation
    setTimeout(() => {
      setError('');
      setSuccess(false);
      setReferenceCode('');
    }, 300);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      setError('Your cart is empty');
      return;
    }

    // Check if user is authenticated
    if (!user) {
      closeCart();
      navigate('/login?redirect=/products');
      return;
    }

    // Check if profile exists
    if (!profile) {
      setError('Please complete your profile before placing an order');
      return;
    }

    // Block order if profile is incomplete
    if (!profile.name || profile.name === 'Customer' || !profile.phone) {
      closeCart();
      navigate('/profile');
      return;
    }

    // Check reference code
    if (!referenceCode.trim()) {
      setError('Reference code is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const companyId = detectCompanyFromDomain();
      if (!companyId) {
        throw new Error('Company not detected');
      }

      // Prepare order data using profile information
      const orderData = {
        company_id: companyId,
        customer_name: profile.name || 'Unknown',
        customer_phone: profile.phone || '',
        customer_email: profile.email || user.email || '',
        notes: referenceCode ? `Ref: ${referenceCode} | Address: ${profile.delivery_address || ''}` : (profile.delivery_address || null),
        items: cart.map(item => ({
          product_id: item.id,
          name: item.name,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price || 0,
          category: item.category || '',
          unit: item.selectedUnit || item.unit || 'pieces'
        })),
        total: total,
        status: 'received',
        created_at: new Date().toISOString()
      };

      // Insert order
      const { data, error: insertError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (insertError) {
        console.error('Order submission error:', insertError);
        throw new Error('Failed to submit order');
      }

      // Clear cart and show success
      clearCart();
      setSuccess(true);
      setReferenceCode('');
    } catch (err) {
      console.error('Order submission failed:', err);
      setError(err.message || 'Failed to submit order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueShopping = () => {
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleBackdropClick}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999,
          animation: 'fadeIn 0.3s ease-out'
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '500px',
          background: 'white',
          boxShadow: '-4px 0 20px rgba(0,0,0,0.2)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideIn 0.3s ease-out'
        }}
        className="cart-drawer"
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShoppingBag size={20} color={navy} />
            <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: navy }}>
              {success ? 'Order Confirmed' : 'Shopping Cart'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = navy}
            onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem'
        }}>
          {success ? (
            <SuccessStep orange={orange} navy={navy} />
          ) : (
            <CartStep
              cart={cart}
              onQuantityChange={handleQuantityChange}
              onRemove={removeItem}
              total={total}
              orange={orange}
              navy={navy}
            />
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div style={{
            padding: '1.25rem 1.5rem',
            borderTop: '1px solid #e5e7eb',
            background: 'white'
          }}>
            {error && (
              <div style={{
                background: '#fee2e2',
                color: '#991b1b',
                padding: '0.75rem',
                borderRadius: '4px',
                marginBottom: '1rem',
                fontSize: '0.8125rem',
                fontWeight: 500,
                border: '1px solid #fecaca'
              }}>
                {error}
              </div>
            )}

            {/* Reference Code Input */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: navy
              }}>
                Reference Code *
              </label>
              <input
                type="text"
                value={referenceCode}
                onChange={(e) => {
                  setReferenceCode(e.target.value);
                  setError('');
                }}
                placeholder="e.g. REF-1234"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${error ? '#dc2626' : '#d1d5db'}`,
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = error ? '#dc2626' : '#000'}
                onBlur={(e) => e.target.style.borderColor = error ? '#dc2626' : '#d1d5db'}
              />
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: navy }}>
                Total:
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: orange }}>
                {total > 0 ? `₹${total.toFixed(2)}` : '—'}
              </span>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={cart.length === 0 || loading}
              style={{
                width: '100%',
                background: cart.length === 0 || loading ? '#d1d5db' : orange,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '0.875rem',
                fontSize: '0.9375rem',
                fontWeight: 600,
                cursor: cart.length === 0 || loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => {
                if (cart.length > 0 && !loading) e.currentTarget.style.background = '#b91c1c';
              }}
              onMouseLeave={(e) => {
                if (cart.length > 0 && !loading) e.currentTarget.style.background = orange;
              }}
            >
              {loading ? 'Submitting...' : user ? 'Place Order' : 'Login to Checkout'}
            </button>
          </div>
        )}

        {success && (
          <div style={{
            padding: '1.25rem 1.5rem',
            borderTop: '1px solid #e5e7eb',
            background: 'white'
          }}>
            <button
              onClick={handleClose}
              style={{
                width: '100%',
                background: orange,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '0.875rem',
                fontSize: '0.9375rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#b91c1c'}
              onMouseLeave={(e) => e.currentTarget.style.background = orange}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        @media (max-width: 768px) {
          .cart-drawer {
            max-width: 100% !important;
          }
        }
      `}</style>
    </>
  );
}

// Cart Step Component
function CartStep({ cart, onQuantityChange, onRemove, total, orange, navy }) {
  if (cart.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem 1rem',
        color: '#64748b'
      }}>
        <ShoppingBag size={64} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
        <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>
          Your cart is empty
        </p>
        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
          Add some products to get started
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {cart.map((item) => (
        <div
          key={item.id}
          style={{
            display: 'flex',
            gap: '1rem',
            padding: '1rem',
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}
        >
          {/* Product Image */}
          <div style={{
            width: '80px',
            height: '80px',
            flexShrink: 0,
            borderRadius: '8px',
            overflow: 'hidden',
            background: '#e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <Package size={32} color="#94a3b8" />
            )}
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{
              margin: '0 0 0.5rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              color: navy
            }}>
              {item.name}
            </h3>
            {item.category && (
              <p style={{
                margin: '0 0 0.5rem',
                fontSize: '0.75rem',
                color: '#64748b',
                fontWeight: 600
              }}>
                {item.category}
              </p>
            )}
            {item.dimensions && (
              <p style={{
                margin: '0 0 0.5rem',
                fontSize: '0.75rem',
                color: '#94a3b8'
              }}>
                {item.dimensions}
              </p>
            )}
            <p style={{
              margin: 0,
              fontSize: '0.9rem',
              fontWeight: 700,
              color: orange
            }}>
              {item.price ? `₹${item.price}` : 'Quote Based'}
              {item.unit && item.price && (
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                  {' '}/ {item.unit}
                </span>
              )}
            </p>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '0.5rem'
          }}>
            {/* Quantity Controls */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'white',
              borderRadius: '8px',
              padding: '0.25rem',
              border: '1px solid #e2e8f0'
            }}>
              <button
                onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  color: navy
                }}
              >
                <Minus size={16} />
              </button>
              <span style={{
                minWidth: '2rem',
                textAlign: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                color: navy
              }}>
                {item.quantity}
              </span>
              <button
                onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  color: navy
                }}
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Remove Button */}
            <button
              onClick={() => onRemove(item.id)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                color: '#ef4444',
                fontSize: '0.8rem',
                fontWeight: 600
              }}
            >
              <Trash2 size={14} />
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Success Step Component
function SuccessStep({ orange, navy }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '2rem 1rem'
    }}>
      <CheckCircle size={80} color="#10b981" style={{ margin: '0 auto 1.5rem' }} />
      <h3 style={{
        margin: '0 0 1rem',
        fontSize: '1.5rem',
        fontWeight: 700,
        color: navy
      }}>
        Order Placed Successfully!
      </h3>
      <p style={{
        margin: '0 0 1.5rem',
        fontSize: '1rem',
        color: '#64748b',
        lineHeight: 1.6
      }}>
        Thank you for your order. We have received your request and will contact you shortly to confirm the details.
      </p>
      <div style={{
        background: '#f0fdf4',
        border: '1px solid #86efac',
        borderRadius: '8px',
        padding: '1rem',
        marginTop: '1.5rem'
      }}>
        <p style={{
          margin: 0,
          fontSize: '0.875rem',
          color: '#166534',
          lineHeight: 1.5
        }}>
          You can view your order history in your profile section.
        </p>
      </div>
    </div>
  );
}
