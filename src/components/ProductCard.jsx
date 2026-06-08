import React, { useState, useEffect } from 'react';
import { Package, Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { detectAndLoadCompany } from '../lib/domainDetection';

export default function ProductCard({ product, onAddToCart, onClick }) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const { cart, updateQuantity, removeItem } = useCart();
  const [companyPhone, setCompanyPhone] = useState('');

  useEffect(() => {
    detectAndLoadCompany().then(({ company }) => {
      if (company) {
         setCompanyPhone(company.contact_phone || company.phone || '');
      }
    });
  }, []);

  const handleRequestQuote = (e) => {
    e.stopPropagation();
    const phone = companyPhone ? companyPhone.replace(/\D/g, '') : '';
    const formattedPhone = phone.length === 10 ? `91${phone}` : phone;
    
    const message = `Hi, I would like to request a quote for:
*${product.name}*
${product.brand ? `Brand: ${product.brand}\n` : ''}${selectedSize ? `Size: ${selectedSize}\n` : ''}${product.description ? `Details: ${product.description}\n` : ''}
Product Link: ${window.location.origin}/products

Could you please provide the pricing and availability?`;

    const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const red = '#dc2626';
  const black = '#000000';

  // Get size options from the size array field
  let sizeOptions = [];
  if (Array.isArray(product.size)) {
    sizeOptions = product.size;
  } else if (product.sizes && Array.isArray(product.sizes)) {
    sizeOptions = product.sizes;
  } else if (typeof product.size === 'string' && product.size) {
    sizeOptions = product.size.split(',').map(s => s.trim());
  }

  // Pre-select first size if available
  useEffect(() => {
    if (sizeOptions.length > 0 && !selectedSize) {
      setSelectedSize(sizeOptions[0]);
    }
  }, [sizeOptions, selectedSize]);

  // Check if specific variant is in cart
  const cartItemId = selectedSize ? `${product.id}-${selectedSize}` : product.id;
  const cartItem = cart.find(item => item.cartItemId === cartItemId);
  const quantity = cartItem?.quantity || 0;


  const images = product.images && product.images.length > 0 ? product.images : (product.image_url ? [product.image_url] : []);

  useEffect(() => {
    if (images.length > 1 && !isHovered) {
      const interval = setInterval(() => {
        setCurrentImgIdx((prev) => (prev + 1) % images.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [images.length, isHovered]);

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImgIdx((prev) => (prev + 1) % images.length);
  };
  
  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImgIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleIncrease = (e) => {
    e.stopPropagation();
    if (quantity === 0) {
      onAddToCart(product, selectedSize);
    } else {
      updateQuantity(cartItemId, quantity + 1);
    }
  };

  const handleDecrease = (e) => {
    e.stopPropagation();
    if (quantity === 1) {
      removeItem(cartItemId);
    } else {
      updateQuantity(cartItemId, quantity - 1);
    }
  };

  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '4px',
        overflow: 'hidden',
        transition: 'all 0.2s',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        boxShadow: isHovered ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
        height: '100%'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Product Image */}
      <div style={{
        position: 'relative',
        paddingTop: '100%', // 1:1 aspect ratio
        background: '#fafafa',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {images.length > 0 && !imageError ? (
            <>
              <img
                src={images[currentImgIdx]}
                alt={product.name}
                onError={() => setImageError(true)}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  padding: '0.5rem'
                }}
              />
              {images.length > 1 && isHovered && (
                <>
                  <button onClick={handlePrevImage} style={{ position: 'absolute', left: 4, background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', padding: 4, cursor: 'pointer', zIndex: 2 }}>
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={handleNextImage} style={{ position: 'absolute', right: 4, background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', padding: 4, cursor: 'pointer', zIndex: 2 }}>
                    <ChevronRight size={16} />
                  </button>
                  <div style={{ position: 'absolute', bottom: 8, display: 'flex', gap: 4, zIndex: 2 }}>
                    {images.map((_, i) => (
                      <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i === currentImgIdx ? red : 'rgba(0,0,0,0.3)' }} />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <Package size={40} color="#d1d5db" />
          )}
        </div>

        {/* Category Badge - Small tag in corner */}
        {product.category && (
          <div style={{
            position: 'absolute',
            top: '0.5rem',
            left: '0.5rem',
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e5e7eb',
            padding: '0.25rem 0.5rem',
            borderRadius: '2px',
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: '#374151',
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
            zIndex: 1
          }}>
            {product.category}
          </div>
        )}

        {/* New Arrival Badge */}
        {product.is_new_arrival && (
          <div style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            padding: '0.25rem 0.6rem',
            borderRadius: '999px',
            fontSize: '0.7rem',
            fontWeight: 800,
            color: 'white',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            boxShadow: '0 2px 8px rgba(220, 38, 38, 0.4)',
            zIndex: 1
          }}>
            ✨ NEW
          </div>
        )}
      </div>

      {/* Product Details */}
      <div style={{
        padding: '0.875rem',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        {/* Brand */}
        {product.brand && (
          <p style={{
            margin: 0,
            fontSize: '0.75rem',
            color: '#6b7280',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.02em'
          }}>
            {product.brand}
          </p>
        )}

        {/* Product Name */}
        <h3 style={{
          margin: 0,
          fontSize: '0.875rem',
          fontWeight: 500,
          color: black,
          lineHeight: 1.3,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '2.6em'
        }}>
          {product.name}
        </h3>

        {/* Size Dropdown - Only show if sizes exist */}
        {sizeOptions.length > 0 && (
          <div style={{ marginTop: '0.25rem' }}>
            <select
              value={selectedSize}
              onChange={(e) => {
                e.stopPropagation();
                setSelectedSize(e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '0.8125rem',
                background: 'white',
                cursor: 'pointer',
                outline: 'none',
                fontFamily: 'inherit',
                fontWeight: 500,
                color: selectedSize ? black : '#9ca3af'
              }}
            >
              <option value="">Select Size</option>
              {sizeOptions.map((size, idx) => (
                <option key={idx} value={size}>{size}</option>
              ))}
            </select>
          </div>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Price - Only show if available */}
        {product.price && (
          <div style={{ marginTop: '0.5rem' }}>
            <span style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: black
            }}>
              ₹{product.price}
            </span>
            {product.unit && (
              <span style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                fontWeight: 500,
                marginLeft: '0.25rem'
              }}>
                / {product.unit}
              </span>
            )}
          </div>
        )}

        {/* Add/Quantity Controls */}
        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
          <div style={{ flex: 1 }}>
            {quantity === 0 ? (
              <button
                onClick={handleIncrease}
                style={{
                  width: '100%',
                  height: '100%',
                  background: red,
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.625rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.375rem',
                  transition: 'background 0.2s',
                  letterSpacing: '0.01em'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#b91c1c')}
                onMouseLeave={(e) => (e.currentTarget.style.background = red)}
              >
                <Plus size={14} />
                ADD
              </button>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#fafafa',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  padding: '0.375rem 0.5rem',
                  height: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <button
                  onClick={handleDecrease}
                  style={{
                    background: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '2px',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: black,
                    fontWeight: 600,
                    fontSize: '1.125rem',
                    flexShrink: 0,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = black;
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.borderColor = black;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.color = black;
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                >
                  −
                </button>
                <span
                  style={{
                    minWidth: '2rem',
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: '0.9375rem',
                    color: black
                  }}
                >
                  {quantity}
                </span>
                <button
                  onClick={handleIncrease}
                  style={{
                    background: black,
                    border: '1px solid ' + black,
                    borderRadius: '2px',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '1.125rem',
                    flexShrink: 0,
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#1f2937'}
                  onMouseLeave={(e) => e.currentTarget.style.background = black}
                >
                  +
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleRequestQuote}
            style={{
              flex: 1,
              background: black,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '0.625rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.375rem',
              transition: 'background 0.2s',
              letterSpacing: '0.01em'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#333')}
            onMouseLeave={(e) => (e.currentTarget.style.background = black)}
          >
            QUOTE
          </button>
        </div>
      </div>
    </div>
  );
}
