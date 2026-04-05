import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, Plus, Minus, Package } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { detectCompanyFromDomain } from '../lib/domainDetection';

export default function Cart() {
  const { cart, updateQuantity, updateUnit, removeItem, clearCart, total, itemCount } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [referenceCode, setReferenceCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inputValues, setInputValues] = useState({}); // For typable quantity

  const orange = '#dc2626'; // Red accent
  const navy = '#000000'; // Black

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      setError('Your cart is empty');
      return;
    }

    if (!user) {
      navigate('/login?redirect=/cart');
      return;
    }

    if (!profile) {
      setError('Please complete your profile before placing an order');
      return;
    }

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

      const orderData = {
        company_id: companyId,
        customer_id: profile.id,
        customer_name: profile.name || 'Unknown',
        customer_phone: profile.phone || '',
        customer_email: profile.email || user.email || '',
        customer_address: profile.delivery_address || '',
        employee_reference_id: referenceCode,
        items: cart.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price || 0,
          category: item.category || '',
          unit: item.selectedUnit || item.unit || 'pieces'
        })),
        total_amount: total,
        status: 'pending',
        notes: null
      };

      const { data, error: insertError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (insertError) {
        console.error('Order submission error:', insertError);
        throw new Error('Failed to submit order');
      }

      clearCart();
      setReferenceCode('');
      alert('Order submitted successfully! Our team will contact you shortly.');
      navigate('/orders');
    } catch (err) {
      console.error('Order submission failed:', err);
      setError(err.message || 'Failed to submit order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', paddingTop: '80px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' }}>
        {/* Header */}
        <div style={{
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h1 style={{
            margin: '0 0 0.5rem',
            fontSize: '1.75rem',
            fontWeight: 700,
            color: navy,
            letterSpacing: '-0.01em'
          }}>
            Shopping Cart
          </h1>
          <p style={{
            margin: 0,
            fontSize: '0.875rem',
            color: '#6b7280',
            fontWeight: 500
          }}>
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </p>
        </div>

        {cart.length === 0 ? (
          <div style={{
            background: '#fafafa',
            borderRadius: '12px',
            padding: '5rem 2rem',
            textAlign: 'center',
            border: '1px solid #e5e7eb'
          }}>
            <ShoppingBag size={64} color="#d1d5db" style={{ margin: '0 auto 1.5rem' }} />
            <h2 style={{
              margin: '0 0 0.75rem',
              fontSize: '1.75rem',
              fontWeight: 700,
              color: navy
            }}>
              Your cart is empty
            </h2>
            <p style={{
              margin: '0 0 2rem',
              fontSize: '1rem',
              color: '#64748b'
            }}>
              Browse our products and add items to your cart
            </p>
            <button
              onClick={() => navigate('/products')}
              style={{
                background: orange,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '1rem 2.5rem',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                letterSpacing: '0.01em'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#b91c1c';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = orange;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth <= 968 ? '1fr' : '1.5fr 1fr',
            gap: '2.5rem'
          }}>
            {/* Cart Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cart.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: 'white',
                    borderRadius: '4px',
                    padding: '1.25rem',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    gap: '1.25rem',
                    transition: 'box-shadow 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                >
                  {/* Product Image */}
                  <div style={{
                    width: '100px',
                    height: '100px',
                    flexShrink: 0,
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: '#f9fafb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #e5e7eb'
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
                      <Package size={36} color="#d1d5db" />
                    )}
                  </div>

                  {/* Product Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                      margin: '0 0 0.5rem',
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      color: navy,
                      letterSpacing: '-0.01em'
                    }}>
                      {item.name}
                    </h3>
                    {item.category && (
                      <p style={{
                        margin: '0 0 0.5rem',
                        fontSize: '0.875rem',
                        color: '#64748b',
                        fontWeight: 500
                      }}>
                        {item.category}
                      </p>
                    )}
                    {item.dimensions && (
                      <p style={{
                        margin: '0 0 0.75rem',
                        fontSize: '0.875rem',
                        color: '#94a3b8'
                      }}>
                        {item.dimensions}
                      </p>
                    )}
                    <p style={{
                      margin: 0,
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: orange
                    }}>
                      {item.price ? `₹${item.price}` : 'Quote Based'}
                      {item.unit && item.price && (
                        <span style={{ fontSize: '0.875rem', color: '#94a3b8', fontWeight: 500 }}>
                          {' '}/ {item.unit}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '0.75rem',
                    justifyContent: 'space-between'
                  }}>
                    {/* Unit Selector */}
                    <select
                      value={item.selectedUnit || item.unit || 'pieces'}
                      onChange={(e) => updateUnit(item.id, e.target.value)}
                      style={{
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '0.8125rem',
                        background: 'white',
                        cursor: 'pointer',
                        outline: 'none',
                        fontFamily: 'inherit',
                        fontWeight: 500,
                        color: navy
                      }}
                    >
                      <option value="pieces">Pieces</option>
                      <option value="bundles">Bundles</option>
                      <option value="kgs">Kgs</option>
                    </select>

                    {/* Quantity Controls */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      background: '#f9fafb',
                      borderRadius: '4px',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #e5e7eb'
                    }}>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        style={{
                          background: 'white',
                          border: '1px solid #000',
                          borderRadius: '2px',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: '#000',
                          fontWeight: 600,
                          fontSize: '1.25rem',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#000';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'white';
                          e.currentTarget.style.color = '#000';
                        }}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={inputValues[item.id] !== undefined ? inputValues[item.id] : item.quantity}
                        onFocus={() => setInputValues(v => ({ ...v, [item.id]: String(item.quantity) }))}
                        onChange={e => setInputValues(v => ({ ...v, [item.id]: e.target.value }))}
                        onBlur={e => {
                          const v = parseInt(e.target.value);
                          if (!isNaN(v) && v >= 1) {
                            handleQuantityChange(item.id, v);
                          } else {
                            handleQuantityChange(item.id, 1);
                          }
                          setInputValues(v => { const n = { ...v }; delete n[item.id]; return n; });
                        }}
                        style={{
                          width: '60px',
                          textAlign: 'center',
                          fontWeight: 600,
                          fontSize: '1.125rem',
                          color: navy,
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          padding: '0.25rem',
                          outline: 'none'
                        }}
                      />
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        style={{
                          background: '#000',
                          border: '1px solid #000',
                          borderRadius: '2px',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '1.25rem',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#1f2937'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#000'}
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#dc2626',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        padding: '0.5rem',
                        transition: 'color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#991b1b'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#dc2626'}
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              {/* Clear Cart Button */}
              <button
                onClick={clearCart}
                style={{
                  background: 'white',
                  color: '#dc2626',
                  border: '1.5px solid #dc2626',
                  borderRadius: '8px',
                  padding: '0.875rem 1.5rem',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  alignSelf: 'flex-start',
                  marginTop: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#dc2626';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.color = '#dc2626';
                }}
              >
                Clear Cart
              </button>
            </div>

            {/* Order Summary */}
            <div>
              <div style={{
                background: '#ffffff',
                borderRadius: '4px',
                padding: '1.5rem',
                border: '1px solid #e5e7eb',
                position: 'sticky',
                top: '100px'
              }}>
                <h2 style={{
                  margin: '0 0 1.25rem',
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: navy,
                  letterSpacing: '-0.01em'
                }}>
                  Order Summary
                </h2>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.75rem',
                  fontSize: '0.875rem',
                  color: '#6b7280'
                }}>
                  <span style={{ fontWeight: 500 }}>Total Items:</span>
                  <span style={{ fontWeight: 600, color: navy }}>{itemCount}</span>
                </div>

                {total > 0 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.75rem',
                    fontSize: '0.875rem',
                    color: '#6b7280'
                  }}>
                    <span style={{ fontWeight: 500 }}>Subtotal:</span>
                    <span style={{ fontWeight: 600, color: navy }}>₹{total.toFixed(2)}</span>
                  </div>
                )}

                <hr style={{
                  border: 'none',
                  borderTop: '1px solid #e5e7eb',
                  margin: '1rem 0'
                }} />

                {total > 0 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '1.5rem',
                    fontSize: '1.125rem',
                    fontWeight: 700
                  }}>
                    <span style={{ color: navy }}>Total:</span>
                    <span style={{ color: orange }}>₹{total.toFixed(2)}</span>
                  </div>
                )}

                {/* Reference Code Input */}
                <div style={{ marginBottom: '1.25rem' }}>
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
                  {error && (
                    <p style={{
                      margin: '0.375rem 0 0',
                      fontSize: '0.75rem',
                      color: '#dc2626',
                      fontWeight: 500
                    }}>
                      {error}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleSubmitOrder}
                  disabled={loading || !user}
                  style={{
                    width: '100%',
                    background: loading || !user ? '#d1d5db' : orange,
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.875rem',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    cursor: loading || !user ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    letterSpacing: '0.01em'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading && user) {
                      e.currentTarget.style.background = '#b91c1c';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading && user) {
                      e.currentTarget.style.background = orange;
                    }
                  }}
                >
                  {loading ? 'Submitting...' : user ? 'Place Order' : 'Login to Checkout'}
                </button>

                {!user && (
                  <p style={{
                    margin: '0.875rem 0 0',
                    fontSize: '0.8125rem',
                    color: '#6b7280',
                    textAlign: 'center',
                    fontWeight: 500
                  }}>
                    You need to login to place an order
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
